<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $author;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic users
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $this->author = User::create([
            'name' => 'Author User',
            'email' => 'author@example.com',
            'password' => Hash::make('password'),
            'role' => 'author',
        ]);

        // Seed basic category
        $this->category = Category::create([
            'name' => 'Teknologi',
            'slug' => 'teknologi',
        ]);
    }

    public function test_register_successful(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Author',
            'email' => 'newauthor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'author')
            ->assertJsonPath('user.name', 'New Author');

        $this->assertDatabaseHas('users', [
            'email' => 'newauthor@example.com',
            'role' => 'author',
        ]);
    }

    public function test_register_validation_failed(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'invalidemail',
            'password' => 'password123',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_login_successful(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']])
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_login_failed(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Email atau password salah.']);
    }

    public function test_get_public_posts(): void
    {
        // Create a published post
        Post::create([
            'title' => 'Published Post',
            'slug' => 'published-post',
            'content' => 'Content here',
            'status' => 'published',
            'user_id' => $this->author->id,
            'category_id' => $this->category->id,
        ]);

        // Create a draft post
        Post::create([
            'title' => 'Draft Post',
            'slug' => 'draft-post',
            'content' => 'Content here',
            'status' => 'draft',
            'user_id' => $this->author->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->getJson('/api/posts');

        $response->assertStatus(200)
            ->assertJsonCount(1) // only published post should be returned
            ->assertJsonPath('0.slug', 'published-post');
    }

    public function test_get_categories(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonPath('0.slug', 'teknologi');
    }

    public function test_protected_user_profile_without_token(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_protected_user_profile_with_token(): void
    {
        $response = $this->actingAs($this->author, 'sanctum')->getJson('/api/user');
        $response->assertStatus(200)
            ->assertJsonPath('email', 'author@example.com');
    }

    public function test_create_post_authorized(): void
    {
        $response = $this->actingAs($this->author, 'sanctum')->postJson('/api/posts', [
            'title' => 'New Post Created',
            'content' => 'Testing content',
            'category_id' => $this->category->id,
            'status' => 'published',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('post.title', 'New Post Created');
    }

    public function test_create_category_admin_only(): void
    {
        // Try creating with author -> should be 403
        $responseAuthor = $this->actingAs($this->author, 'sanctum')->postJson('/api/categories', [
            'name' => 'Design',
        ]);
        $responseAuthor->assertStatus(403);

        // Try creating with admin -> should be 201
        $responseAdmin = $this->actingAs($this->admin, 'sanctum')->postJson('/api/categories', [
            'name' => 'Design',
        ]);
        $responseAdmin->assertStatus(201)
            ->assertJsonPath('category.slug', 'design');
    }
}
