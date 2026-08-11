<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    /**
     * Display a listing of posts.
     * Public index returns only published posts.
     * Dashboard index (if dashboard=1 query is set and authenticated) returns appropriate posts.
     */
    public function index(Request $request)
    {
        $query = Post::with(['user', 'category'])->withCount('likedByUsers');

        // Check if loading for Dashboard
        if ($request->query('dashboard') == 1) {
            $user = $request->user('sanctum');
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            // Admin gets all posts, Author gets only their own posts
            if ($user->role !== 'admin') {
                $query->where('user_id', $user->id);
            }
        } else {
            // Public index: only published posts
            $query->where('status', 'published');

            // Category filter by category_id or slug
            if ($request->has('category_id')) {
                $query->where('category_id', $request->query('category_id'));
            }
            if ($request->has('category_slug')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->query('category_slug'));
                });
            }

            // Simple search filter
            if ($request->has('search')) {
                $search = $request->query('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%");
                });
            }
        }

        $currentUser = $request->user('sanctum');
        $posts = $query->orderBy('created_at', 'desc')->get();

        $posts->each(function ($post) use ($currentUser) {
            $post->likes_count = $post->liked_by_users_count;
            $post->liked_by_current_user = $currentUser 
                ? $post->likedByUsers()->where('user_id', $currentUser->id)->exists() 
                : false;
        });

        return response()->json($posts);
    }

    /**
     * Store a newly created post.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:draft,published',
            'excerpt' => 'nullable|string',
        ]);

        // Generate unique slug
        $baseSlug = Str::slug($request->title);
        $slug = $baseSlug;
        $counter = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $post = Post::create([
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->content,
            'excerpt' => $request->excerpt ?? Str::limit(strip_tags($request->content), 150),
            'status' => $request->status,
            'category_id' => $request->category_id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Postingan berhasil dibuat.',
            'post' => $post->load(['user', 'category'])
        ], 201);
    }

    /**
     * Display a single post by slug (Public).
     */
    public function show($slug)
    {
        $post = Post::with(['user', 'category'])->where('slug', $slug)->firstOrFail();

        // Cek draft permission
        if ($post->status !== 'published') {
            $user = request()->user('sanctum');
            if (!$user || ($user->role !== 'admin' && $user->id !== $post->user_id)) {
                return response()->json(['message' => 'Postingan tidak ditemukan.'], 404);
            }
        }

        // Cek apakah user yang login saat ini sudah me-like artikel ini
        $currentUser = request()->user('sanctum');
        $likedByCurrentUser = false;
        if ($currentUser) {
            $likedByCurrentUser = $post->likedByUsers()->where('user_id', $currentUser->id)->exists();
        }

        // Sisipkan atribut tambahan ke dalam objek post
        $post->likes_count = $post->likedByUsers()->count();
        $post->liked_by_current_user = $likedByCurrentUser;

        return response()->json($post);
    }

    /**
     * Update the specified post.
     */
    public function update(Request $request, Post $post)
    {
        Gate::authorize('update', $post);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:draft,published',
            'excerpt' => 'nullable|string',
        ]);

        // Generate unique slug if title changes
        $slug = $post->slug;
        if ($request->title !== $post->title) {
            $baseSlug = Str::slug($request->title);
            $slug = $baseSlug;
            $counter = 1;
            while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        $post->update([
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->content,
            'excerpt' => $request->excerpt ?? Str::limit(strip_tags($request->content), 150),
            'status' => $request->status,
            'category_id' => $request->category_id,
        ]);

        return response()->json([
            'message' => 'Postingan berhasil diperbarui.',
            'post' => $post->load(['user', 'category'])
        ]);
    }

    /**
     * Remove the specified post.
     */
    public function destroy(Post $post)
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return response()->json([
            'message' => 'Postingan berhasil dihapus.'
        ]);
    }


    /**
     * Menyukai atau batal menyukai postingan (Toggle Like/Unlike).
     */
    public function toggleLike(Request $request, Post $post)
    {
        $user = $request->user();

        // Cek apakah user sudah menyukai postingan ini sebelumnya
        $hasLiked = $post->likedByUsers()->where('user_id', $user->id)->exists();

        if ($hasLiked) {
            // Batal menyukai (Unlike) -> hapus baris di tabel pivot
            $post->likedByUsers()->detach($user->id);
            $liked = false;
            $message = 'Batal menyukai postingan.';
        } else {
            // Menyukai (Like) -> tambahkan baris di tabel pivot
            $post->likedByUsers()->attach($user->id);
            $liked = true;
            $message = 'Postingan disukai.';
        }

        // Ambil total like terbaru
        $likesCount = $post->likedByUsers()->count();

        return response()->json([
            'message' => $message,
            'liked' => $liked,
            'likes_count' => $likesCount
        ]);
    }
}
