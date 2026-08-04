# CMS Blog Post (Laravel 12 REST API & Next.js 16)

Proyek ini adalah sistem manajemen konten (CMS) sederhana untuk postingan blog yang dibangun menggunakan **Laravel 12** sebagai backend REST API terproteksi token (Laravel Sanctum), dan **Next.js 16** (Tailwind CSS & Lucide Icons) sebagai frontend.

---

## Fitur Utama

1. **Autentikasi Token (Sanctum)**: Sistem login aman berbasis token API.
2. **Multi-Role (Admin & Author)**:
   - **Admin**: Dapat melakukan CRUD semua postingan, mengelola kategori, serta mengelola data pengguna (user management).
   - **Author**: Hanya dapat membuat postingan baru, serta memperbarui/menghapus postingan miliknya sendiri.
3. **Filter Kategori & Pencarian**: Halaman depan publik dilengkapi filter kategori interaktif dan kolom pencarian.
4. **Desain Premium**: Menggunakan Tailwind CSS versi terbaru, efek glow modern, layout dashboard responsif, dan modal CRUD dinamis.

---

## Akun Demo Default

Jalankan seeder untuk membuat akun uji coba berikut:

| Peran (Role) | Email | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `admin@example.com` | `password` | Akses penuh (Postingan, Kategori, User) |
| **Author** | `author@example.com` | `password` | Akses menulis & mengedit postingan milik sendiri |

---

## Cara Instalasi & Menjalankan Proyek

### 1. Setup Backend (Laravel API)

Backend menggunakan **SQLite** secara default (konfigurasi sudah disiapkan).

1. Pastikan Anda berada di direktori utama `/blog-cms-api`
2. Pasang dependensi PHP Composer:
   ```bash
   composer install
   ```
3. Salin konfigurasi environment:
   ```bash
   copy .env.example .env
   ```
4. Generate key aplikasi:
   ```bash
   php artisan key:generate
   ```
5. Jalankan migrasi database dan pengisian data demo (seed):
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Jalankan server lokal Laravel:
   ```bash
   php artisan serve
   ```

---

### 2. Setup Frontend (Next.js)

1. Masuk ke direktori frontend:
   ```bash
   cd blog-cms-frontend
   ```
2. Pasang dependensi Node.js:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal (Next.js):
   ```bash
   npm run dev
   ```
---

## Struktur Folder Utama

```text
blog-cms-api/
├── app/
│   ├── Http/Controllers/Api/   # Controller REST API (Auth, Post, Category, AdminUser)
│   ├── Models/                 # Model Eloquent (User, Category, Post)
│   ├── Policies/               # Kebijakan otorisasi (PostPolicy)
│   └── Http/Middleware/        # Proteksi peran admin (IsAdmin middleware)
├── database/
│   ├── migrations/             # Skema database
│   └── seeders/                # Data dummy awal (DatabaseSeeder)
├── routes/
│   └── api.php                 # Definsi rute API RESTful
└── blog-cms-frontend/          # Proyek Frontend Next.js (App Router)
    ├── src/
    │   ├── app/                # Halaman & Rute Aplikasi Next.js
    │   │   ├── admin/dashboard # Dashboard (Posts, Categories, Users)
    │   │   ├── admin/login     # Halaman Login Admin/Author
    │   │   ├── posts/[slug]    # Halaman Baca Detail Artikel
    │   │   └── page.tsx        # Homepage Publik dengan filter & pencarian
    │   └── lib/
    │       └── api.ts          # Axios client terkonfigurasi dengan token interceptor
```

---

## Pengujian Otomatis (Backend)

Backend dilengkapi dengan Feature Tests untuk memastikan hak akses, autentikasi, dan CRUD berjalan sesuai aturan.
Jalankan pengujian menggunakan:
```bash
php artisan test
```
