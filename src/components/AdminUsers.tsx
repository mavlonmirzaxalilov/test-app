import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Loader2, MapPin, Calendar, Search, Trash2 } from 'lucide-react';
import { databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { cn } from '../lib/utils';
import { Query } from 'appwrite';

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function fetchUsers() {
    try {
      const res = await databases.listDocuments<UserProfile>(
        APPWRITE_CONFIG.databaseId!,
        APPWRITE_CONFIG.collections.users!
      );
      setUsers(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm('Ushbu foydalanuvchini o\'chirmoqchimisiz?')) return;
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.databaseId!,
        APPWRITE_CONFIG.collections.users!,
        id
      );
      setUsers(prev => prev.filter(u => u.$id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const updateRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!confirm(`Rolni "${newRole}" ga o'zgartirmoqchimisiz?`)) return;
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId!,
        APPWRITE_CONFIG.collections.users!,
        id,
        { role: newRole }
      );
      setUsers(prev => prev.map(u => u.$id === id ? { ...u, role: newRole as 'student' | 'admin' } : u));
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const filtered = users.filter(u =>
    `${u.name} ${u.surname}`.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.branch.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></div>;

  return (
    <div className="p-8 space-y-10 mt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Personnel Database</h2>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">Registered <span className="text-blue-600">Units</span></h1>
        </div>
        <div className="relative min-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
          <input
            type="text"
            placeholder="Search by name, phone, branch..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Holat</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">To'liq ism</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Kontakt</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Sektor / Yosh</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Sana</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Amal</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filtered.map((u) => (
                <tr key={u.$id} className="border-b-2 border-gray-100 hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 border-2 text-[9px] font-black uppercase tracking-tighter rounded-md",
                      u.role === 'admin' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-green-500 bg-green-50 text-green-500"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black italic text-sm">{u.name} {u.surname}</td>
                  <td className="px-6 py-4 font-bold text-xs">{u.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{u.branch}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{u.ageCategory}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[10px] text-gray-400 tabular-nums">
                    {new Date(u.$createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateRole(u.$id, u.role)}
                        className={cn(
                          "px-3 py-1.5 border-2 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all hover:opacity-80",
                          u.role === 'admin'
                            ? "border-green-500 text-green-600 hover:bg-green-50"
                            : "border-blue-600 text-blue-600 hover:bg-blue-50"
                        )}
                      >
                        {u.role === 'admin' ? '→ Student' : '→ Admin'}
                      </button>
                      <button
                        onClick={() => deleteUser(u.$id)}
                        className="p-2 border-2 border-red-200 text-red-400 rounded-md hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
