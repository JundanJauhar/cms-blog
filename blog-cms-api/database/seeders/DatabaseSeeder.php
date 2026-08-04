<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::create([
            'name' => 'Admin CMS',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $author = User::create([
            'name' => 'Author CMS',
            'email' => 'author@example.com',
            'password' => Hash::make('password'),
            'role' => 'author',
        ]);

        // 2. Seed Categories
        $categoriesData = ['Teknologi', 'Gaya Hidup', 'Kuliner', 'Perjalanan', 'Edukasi'];
        $categories = [];
        foreach ($categoriesData as $name) {
            $categories[] = Category::create([
                'name' => $name,
                'slug' => Str::slug($name),
            ]);
        }

        // 3. Seed Posts
        $postsData = [
            [
                'title' => 'Pengenalan Laravel 12 untuk Pemula',
                'content' => 'Laravel 12 hadir dengan berbagai fitur baru yang mempermudah pengembangan aplikasi web. Salah satu fitur menariknya adalah optimasi routing dan support PHP terbaru. Dalam artikel ini, kita akan membahas cara menginstal Laravel 12 dan membuat REST API sederhana menggunakan Laravel Sanctum.',
                'status' => 'published',
                'user_id' => $admin->id,
                'category_index' => 0, // Teknologi
            ],
            [
                'title' => 'Tips Produktivitas Kerja Remote',
                'content' => 'Kerja remote atau WFH membutuhkan disiplin diri yang tinggi agar produktivitas tetap terjaga. Buatlah ruang kerja khusus, tentukan jam kerja yang konsisten, dan hindari distraksi selama jam produktif Anda.',
                'status' => 'published',
                'user_id' => $author->id,
                'category_index' => 1, // Gaya Hidup
            ],
            [
                'title' => '5 Makanan Khas Indonesia yang Wajib Dicoba',
                'content' => 'Indonesia kaya akan kuliner nusantara yang lezat dan berempah. Mulai dari Rendang Sumatra Barat, Nasi Goreng, Sate Madura, Gado-Gado, hingga Pempek Palembang. Semuanya menawarkan keunikan rasa masing-masing.',
                'status' => 'published',
                'user_id' => $author->id,
                'category_index' => 2, // Kuliner
            ],
            [
                'title' => 'Destinasi Wisata Terbaik di Bali 2026',
                'content' => 'Bali tidak pernah kehabisan pesonanya. Di tahun 2026 ini, beberapa destinasi wisata alam tersembunyi di daerah Bali Utara dan Nusa Penida mulai ramai dikunjungi wisatawan lokal maupun mancanegara.',
                'status' => 'published',
                'user_id' => $admin->id,
                'category_index' => 3, // Perjalanan
            ],
            [
                'title' => 'Pentingnya Belajar Coding Sejak Dini',
                'content' => 'Belajar pemrograman atau coding sejak usia muda melatih logika berpikir sistematis dan kemampuan pemecahan masalah (problem solving) pada anak-anak. Saat ini sudah banyak platform edukasi ramah anak.',
                'status' => 'published',
                'user_id' => $author->id,
                'category_index' => 4, // Edukasi
            ],
            [
                'title' => 'Draf Artikel Teknologi Masa Depan (AI & IoT)',
                'content' => 'Artikel ini masih berupa draf. Kecerdasan Buatan (AI) digabungkan dengan Internet of Things (IoT) akan mengubah cara manusia berinteraksi dengan perangkat rumah tangga sehari-hari secara drastis.',
                'status' => 'draft',
                'user_id' => $author->id,
                'category_index' => 0, // Teknologi
            ],
            [
                'title' => 'Draf Ide Bisnis Kuliner Kreatif',
                'content' => 'Ini draf ide bisnis kuliner. Menggabungkan makanan tradisional dengan kemasan modern dan pemasaran digital melalui sosial media serta platform pesan antar online.',
                'status' => 'draft',
                'user_id' => $admin->id,
                'category_index' => 2, // Kuliner
            ],
        ];

        foreach ($postsData as $p) {
            $category = $categories[$p['category_index']];
            Post::create([
                'title' => $p['title'],
                'slug' => Str::slug($p['title']),
                'content' => $p['content'],
                'excerpt' => Str::limit($p['content'], 150),
                'status' => $p['status'],
                'user_id' => $p['user_id'],
                'category_id' => $category->id,
            ]);
        }
    }
}
