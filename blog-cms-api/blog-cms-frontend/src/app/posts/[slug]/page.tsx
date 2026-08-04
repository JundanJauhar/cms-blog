'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Calendar, User, Clock, Tag } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  user?: {
    name: string;
  };
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${slug}`);
        setPost(res.data);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        if (err.response && err.response.status === 404) {
          setError('Artikel tidak ditemukan atau belum dipublikasikan.');
        } else {
          setError('Terjadi kesalahan saat memuat artikel.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <p className="text-indigo-400 font-bold text-lg mb-4">Error</p>
          <p className="text-zinc-300 mb-6">{error || 'Artikel tidak ditemukan.'}</p>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold mx-auto transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-indigo-400 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          {post.category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider mb-6">
              <Tag className="w-3 h-3" />
              {post.category.name}
            </span>
          )}

          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tight leading-tight text-zinc-50">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 border-y border-zinc-900 py-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-indigo-400">
                {post.user?.name.charAt(0) || 'U'}
              </div>
              <span className="font-semibold text-zinc-300">{post.user?.name || 'Author'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>{formatDate(post.created_at)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>3 menit baca</span>
            </div>
          </div>
        </header>

        {/* Excerpt panel */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 mb-10 text-zinc-300 italic text-base leading-relaxed">
          {post.excerpt}
        </div>

        {/* Content body */}
        <article className="prose prose-invert prose-indigo max-w-none text-zinc-300 leading-relaxed text-base md:text-lg space-y-6">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (!paragraph.trim()) return null;
            return <p key={index} className="indent-0 text-zinc-300">{paragraph}</p>;
          })}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-10 mt-20 text-center text-zinc-650 text-sm">
        <p className="mb-2">© {new Date().getFullYear()} Blog CMS. All rights reserved.</p>
        <p className="text-zinc-650 text-xs">Dibuat dengan Laravel 12 & Next.js</p>
      </footer>
    </div>
  );
}
