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
  Users,
  Shield,
  Mail,
  User as UserIcon
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'author';
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // null means "Create Mode"
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'author'>('author');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Authenticated user (to prevent self-deletion)
  const [authUserId, setAuthUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('blog_cms_user');
      if (userStr) {
        try {
          const authUser = JSON.parse(userStr);
          setAuthUserId(authUser.id);
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('author');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(''); // blank for edit unless they want to change password
    setFormRole(user.role);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = async (userToDelete: User) => {
    if (authUserId === userToDelete.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus user "${userToDelete.name}"?`)) return;

    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setUsers(users.filter(u => u.id !== userToDelete.id));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    if (!formName || !formEmail || (!currentUser && !formPassword)) {
      setFormError('Nama, email, dan password (untuk user baru) wajib diisi.');
      setSubmitting(false);
      return;
    }

    const payload: any = {
      name: formName,
      email: formEmail,
      role: formRole,
    };

    if (formPassword) {
      payload.password = formPassword;
    }

    try {
      if (currentUser) {
        // Edit mode
        const res = await api.put(`/admin/users/${currentUser.id}`, payload);
        setUsers(users.map(u => u.id === currentUser.id ? res.data.user : u));
      } else {
        // Create mode
        const res = await api.post('/admin/users', payload);
        setUsers([res.data.user, ...users]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error('Error submitting user:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Gagal menyimpan user.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Manajemen Pengguna</h2>
          <p className="text-sm text-zinc-550 mt-1">Kelola akun admin dan penulis dalam sistem CMS</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition-all text-white self-start shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah User</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 items-center">
        <Search className="w-4 h-4 text-zinc-500 mr-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari user berdasarkan nama atau email..."
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
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
          <Users className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
          <p className="text-zinc-400 font-semibold mb-1">Belum ada user</p>
          <p className="text-zinc-600 text-sm">Klik tombol "Tambah User" untuk mendaftarkan akun baru.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Hak Akses (Role)</th>
                  <th className="px-6 py-4">Terdaftar Sejak</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase text-indigo-400">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-bold text-zinc-200">{user.name}</span>
                        {authUserId === user.id && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                            Anda
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-indigo-500/10 text-indigo-450 border border-indigo-500/10'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-750'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-550">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={authUserId === user.id}
                          className={`p-1.5 rounded-lg transition-all ${
                            authUserId === user.id 
                              ? 'text-zinc-700 cursor-not-allowed' 
                              : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/5 cursor-pointer'
                          }`}
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

      {/* User CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full relative z-10 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="font-extrabold text-lg">
                {currentUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
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

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap user..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Alamat Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-455 mb-2">
                  {currentUser ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!currentUser}
                  placeholder={currentUser ? '••••••••' : 'Password minimal 8 karakter'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-650 transition-all"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-450 mb-2">
                  Hak Akses (Role)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormRole('author')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      formRole === 'author'
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:text-zinc-300'
                    }`}
                  >
                    Author
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRole('admin')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      formRole === 'admin'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-450 hover:text-zinc-300'
                    }`}
                  >
                    Admin
                  </button>
                </div>
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
                  {submitting ? 'Menyimpan...' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
