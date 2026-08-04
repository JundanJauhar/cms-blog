'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { KeyRound, Mail, ArrowRight, Lock, BookOpen } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect straight to dashboard
    if (typeof window !== 'undefined' && localStorage.getItem('blog_cms_token')) {
      router.push('/admin/dashboard/posts');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/login', { email, password });
      const { token, user } = res.data;

      // Save token & user info in localStorage
      localStorage.setItem('blog_cms_token', token);
      localStorage.setItem('blog_cms_user', JSON.stringify(user));

      // Redirect to posts management inside dashboard
      router.push('/admin/dashboard/posts');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login gagal. Periksa koneksi internet Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans p-4 relative overflow-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main card */}
      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">CMS Blog Admin</h1>
          <p className="text-zinc-500 text-sm mt-1">Masuk untuk mengelola postingan dan kategori</p>
        </div>

        {/* Login form card */}
        <div className="bg-zinc-900/60 border border-zinc-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com atau author@example.com"
                  suppressHydrationWarning={true}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-zinc-100 placeholder-zinc-650 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  suppressHydrationWarning={true}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-zinc-100 placeholder-zinc-650 transition-all text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl font-semibold text-white tracking-wide shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk Ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Direct to register */}
          <div className="text-center mt-6 text-sm text-zinc-400">
            <span>Belum memiliki akun? </span>
            <Link href="/admin/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
              Daftar sebagai Author
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-zinc-550 hover:text-indigo-400 transition-colors">
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
