<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories (Public).
     */
    public function index()
    {
        $categories = Category::withCount('posts')->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created category (Admin only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil dibuat.',
            'category' => $category
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Update the specified category (Admin only).
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
        ]);

        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'category' => $category
        ]);
    }

    /**
     * Remove the specified category (Admin only).
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.'
        ]);
    }
}
