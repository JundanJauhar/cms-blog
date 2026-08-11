'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Search, BookOpen, Clock, Calendar, ArrowRight, LayoutDashboard, Heart } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';


interface Category {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  likes_count: number; // Add likes count property
  liked_by_current_user: boolean;
  created_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  user?: {
    name: string;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const router = useRouter();
  const [liked, setLiked] = useState(false);




  useEffect(() => {
    // Check login status
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('blog_cms_token'));
    }

   

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        // Get posts
        const postRes = await api.get('/posts');
        setPosts(postRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLike = async (postId: number) => {
    // Cek apakah user sudah login dengan mengecek keberadaan token
    const token = localStorage.getItem('blog_cms_token');
    if (!token) {
      alert('Anda harus login terlebih dahulu untuk menyukai artikel.');
      router.push('/admin/login');
      return;
    }

    try {
      const res = await api.post(`/posts/${postId}/like`);

      // Perbarui status like dan total likes untuk artikel tertentu di list posts
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            liked_by_current_user: res.data.liked,
            likes_count: res.data.likes_count
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Gagal memproses like:', err);
    }
  };

  // Fetch posts filtered by category or search
  useEffect(() => {
    const fetchFilteredPosts = async () => {
      try {
        setLoading(true);
        let url = '/posts?';
        if (selectedCategory) {
          url += `category_id=${selectedCategory}&`;
        }
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        const res = await api.get(url);
        setPosts(res.data);
      } catch (err) {
        console.error('Error filtering posts:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const delayDebounce = setTimeout(() => {
      if (categories.length > 0) { // skip initial load
        fetchFilteredPosts();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg text-white group-hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              CMS Blog
            </span>
          </Link>

          <Link
            href={isLoggedIn ? '/admin/dashboard/posts' : '/admin/login'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 transition-all duration-200"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            {isLoggedIn ? 'Dashboard' : 'Login'}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-zinc-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-[80px]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
            Temukan Wawasan & <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Inspirasi Baru</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Eksplorasi berbagai artikel berkualitas tentang teknologi, gaya hidup, kuliner, perjalanan, dan edukasi yang ditulis oleh para ahli di bidangnya.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur-[10px] opacity-25 group-hover:opacity-40 transition-all duration-300" />
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500 rounded-xl overflow-hidden transition-all duration-200">
              <Search className="w-5 h-5 text-zinc-500 ml-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari judul artikel atau konten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-4 text-zinc-100 placeholder-zinc-500 focus:outline-none text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mr-4 text-sm text-zinc-500 hover:text-zinc-300 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-zinc-900">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-200 ${selectedCategory === null
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-200 ${selectedCategory === cat.id
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 h-[350px] animate-pulse flex flex-col justify-between">
                <div>
                  <div className="h-6 bg-zinc-800 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-zinc-800 rounded w-1/4 mb-6" />
                  <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
                  <div className="h-4 bg-zinc-800 rounded w-5/6" />
                </div>
                <div className="h-10 bg-zinc-800 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 border border-zinc-900 rounded-2xl">
            <p className="text-zinc-500 text-lg mb-2">Tidak ada artikel ditemukan.</p>
            <p className="text-zinc-600 text-sm">Coba bersihkan pencarian atau ubah filter kategori Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col justify-between group relative shadow-md hover:shadow-indigo-900/10"
              >
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    {post.category && (
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {post.category.name}
                      </span>
                    )}
                    <span className="text-zinc-650 text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 3 mnt baca
                    </span>
                  </div>

                  {/* likes count */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${post.liked_by_current_user
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked_by_current_user ? 'fill-rose-400 text-rose-400' : 'text-zinc-500'}`} />
                      {/* Tampilkan jumlah likes secara dinamis dari database */}
                      <span>{post.likes_count} Likes</span>
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-indigo-400">
                      {post.user?.name.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-300">{post.user?.name || 'Author'}</p>
                      <p className="text-[10px] text-zinc-500">{formatDate(post.created_at)}</p>
                    </div>
                  </div>

                  <Link
                    href={`/posts/${post.slug}`}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-10 mt-20 text-center text-zinc-650 text-sm">
        <p className="mb-2">© {new Date().getFullYear()} Blog CMS. Dibuat dengan Laravel 12 & Next.js.</p>
        <p className="text-zinc-600 text-xs">Sistem Manajemen Konten dengan Sanctum Auth & Tailwind CSS</p>
      </footer>
    </div>
  );
}
