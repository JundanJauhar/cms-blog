'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  FileText, 
  Tag, 
  Users, 
  LogOut, 
  Home, 
  Menu, 
  X, 
  User as UserIcon,
  Shield,
  BookOpen
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'author';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('blog_cms_token');
      const userStr = localStorage.getItem('blog_cms_user');

      if (!token || !userStr) {
        // Clear potential half-stored values
        localStorage.removeItem('blog_cms_token');
        localStorage.removeItem('blog_cms_user');
        router.push('/admin/login');
      } else {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          localStorage.removeItem('blog_cms_token');
          localStorage.removeItem('blog_cms_user');
          router.push('/admin/login');
        } finally {
          setLoading(false);
        }
      }
    }
  }, [router]);

  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari akun Anda?')) {
      return;
    }

    try {
      await api.post('/logout');
    } catch (e) {
      console.error('Logout error on server:', e);
    } finally {
      // Always clear local credentials
      localStorage.removeItem('blog_cms_token');
      localStorage.removeItem('blog_cms_user');
      router.push('/admin/login');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Postingan',
      href: '/admin/dashboard/posts',
      icon: FileText,
      roles: ['admin', 'author'],
    },
    {
      name: 'Kategori',
      href: '/admin/dashboard/categories',
      icon: Tag,
      roles: ['admin'],
    },
    {
      name: 'Manajemen User',
      href: '/admin/dashboard/users',
      icon: Users,
      roles: ['admin'],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-zinc-800">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            CMS Dashboard
          </span>
        </div>

        {/* User Card */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-zinc-100 uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            if (!item.roles.includes(user.role)) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Lihat Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header / Sidebar Drawer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden h-16 flex items-center justify-between px-4 bg-zinc-900 border-b border-zinc-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 text-zinc-400 hover:text-zinc-200"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            CMS Dashboard
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs uppercase text-zinc-100">
            {user.name.charAt(0)}
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            
            {/* Sidebar menu */}
            <aside className="relative flex flex-col w-64 max-w-xs bg-zinc-900 border-r border-zinc-800 z-40">
              <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
                <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  CMS Menu
                </span>
                <button onClick={() => setSidebarOpen(false)} className="text-zinc-450 hover:text-zinc-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div className="p-5 border-b border-zinc-800 bg-zinc-900/50">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-indigo-400 font-extrabold uppercase mt-0.5">{user.role}</p>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-4 space-y-1.5">
                {menuItems.map((item) => {
                  if (!item.roles.includes(user.role)) return null;
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-zinc-800 space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-300"
                >
                  <Home className="w-4 h-4" />
                  <span>Lihat Website</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
