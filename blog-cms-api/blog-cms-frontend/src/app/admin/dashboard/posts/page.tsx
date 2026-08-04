'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Eye, 
  AlertCircle, 
  X,
  FileText,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  created_at: string;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null); // null means "Create Mode"
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Current logged in user info
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('blog_cms_user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    }
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Pass dashboard=1 so the backend applies role filters
      const res = await api.get('/posts?dashboard=1');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const openCreateModal = () => {
    setCurrentPost(null);
    setFormTitle('');
    setFormContent('');
    setFormExcerpt('');
    setFormStatus('draft');
    if (categories.length > 0) {
      setFormCategory(categories[0].id.toString());
    } else {
      setFormCategory('');
    }
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setCurrentPost(post);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormExcerpt(post.excerpt || '');
    setFormCategory(post.category_id.toString());
    setFormStatus(post.status);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert(err.response?.data?.message || 'Gagal menghapus postingan.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!formTitle || !formContent || !formCategory) {
      setFormError('Semua field wajib diisi.');
      setSubmitting(false);
      return;
    }

    const payload = {
      title: formTitle,
      content: formContent,
      excerpt: formExcerpt || undefined,
      category_id: parseInt(formCategory),
      status: formStatus,
    };

    try {
      if (currentPost) {
        // Edit mode
        const res = await api.put(`/posts/${currentPost.id}`, payload);
        // Update local state
        setPosts(posts.map(p => p.id === currentPost.id ? res.data.post : p));
      } else {
        // Create mode
        const res = await api.post('/posts', payload);
        setPosts([res.data.post, ...posts]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const errorMsgs = Object.values(err.response.data.errors).flat().join(' ');
          setFormError(errorMsgs);
        } else {
          setFormError(err.response.data.message || 'Gagal menyimpan postingan.');
        }
      } else {
        setFormError('Gagal menyimpan postingan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Postingan Anda</h2>
          <p className="text-sm text-zinc-550 mt-1">Buat, edit, dan atur tulisan blog Anda</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition-all text-white self-start shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Postingan</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 items-center">
        <Search className="w-4 h-4 text-zinc-500 mr-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari postingan berdasarkan judul..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-zinc-100 placeholder-zinc-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl w-full" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold mb-1">Belum ada postingan</p>
          <p className="text-zinc-600 text-sm">Klik tombol "Buat Postingan" untuk menulis artikel baru.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Kategori</th>
                  {currentUser?.role === 'admin' && <th className="px-6 py-4">Penulis</th>}
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-250">
                      <div className="max-w-[280px] md:max-w-[350px] truncate">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.category ? (
                        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-1 rounded-md">
                          {post.category.name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-6 py-4 font-semibold text-zinc-300">
                        {post.user?.name || 'Author'}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        post.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-450">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status === 'published' && (
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-all"
                            title="Buka Postingan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          {/* Modal Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-extrabold text-lg">
                {currentPost ? 'Edit Postingan' : 'Buat Postingan Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-red-450 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Judul Postingan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul menarik..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all"
                />
              </div>

              {/* Category & Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-200 transition-all"
                  >
                    {categories.length === 0 && <option value="">Tidak ada kategori</option>}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus('draft')}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        formStatus === 'draft'
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:text-zinc-300'
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('published')}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        formStatus === 'published'
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:text-zinc-300'
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Ringkasan Singkat (Excerpt)
                </label>
                <textarea
                  placeholder="Tulis ringkasan singkat postingan Anda... (Kosongkan agar terisi otomatis dari paragraf pertama)"
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all resize-none"
                />
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Konten Lengkap
                </label>
                <textarea
                  required
                  placeholder="Tulis tulisan menarik Anda di sini..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={8}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all resize-y"
                />
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Postingan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
