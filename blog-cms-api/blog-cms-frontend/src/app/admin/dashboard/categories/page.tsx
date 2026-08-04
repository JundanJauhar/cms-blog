'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  AlertCircle, 
  X,
  Tag
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentCategory(null);
    setFormName('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setCurrentCategory(cat);
    setFormName(cat.name);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua postingan di kategori ini mungkin akan terpengaruh.')) return;

    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || 'Gagal menghapus kategori.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!formName.trim()) {
      setFormError('Nama kategori wajib diisi.');
      setSubmitting(false);
      return;
    }

    try {
      if (currentCategory) {
        // Edit mode
        const res = await api.put(`/categories/${currentCategory.id}`, { name: formName });
        setCategories(categories.map(c => c.id === currentCategory.id ? res.data.category : c));
      } else {
        // Create mode
        const res = await api.post('/categories', { name: formName });
        setCategories([...categories, res.data.category]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error submitting category:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menyimpan kategori.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Kategori Postingan</h2>
          <p className="text-sm text-zinc-550 mt-1">Kelola kategori tulisan untuk filter konten di website</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition-all text-white self-start shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 items-center">
        <Search className="w-4 h-4 text-zinc-500 mr-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari kategori..."
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
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
          <Tag className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold mb-1">Belum ada kategori</p>
          <p className="text-zinc-600 text-sm">Klik tombol "Tambah Kategori" untuk membuat kategori baru.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Jumlah Postingan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-200">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-450 font-mono text-xs">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <span className="bg-zinc-800 px-2.5 py-1 rounded-md text-xs font-bold text-zinc-400">
                        {cat.posts_count ?? 0} post
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full relative z-10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-extrabold text-lg">
                {currentCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-zinc-350 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/25 text-red-455 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mobile Development, Lifestyle..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all"
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
                  {submitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
