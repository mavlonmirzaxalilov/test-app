import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Phone, Lock, User as UserIcon, MapPin, Calendar, ArrowRight } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    password: '',
    branch: '',
    ageCategory: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.phone, formData.password);
      } else {
        await register(formData);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen technical-grid flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bento-card p-8"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 border-2 border-black rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            V
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Tizimga kirish</h2>
          <h3 className="text-3xl font-black italic tracking-tighter uppercase">ValiTEach <span className="text-blue-600">Testlari</span></h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black px-1 text-gray-500">Ism</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input
                    required
                    type="text"
                    placeholder="Javohir"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:bg-blue-50/30 transition-all placeholder:font-normal placeholder:opacity-30"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black px-1 text-gray-500">Familiya</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input
                    required
                    type="text"
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:bg-blue-50/30 transition-all placeholder:font-normal placeholder:opacity-30"
                    value={formData.surname}
                    onChange={e => setFormData({...formData, surname: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black px-1 text-gray-500">Telefon raqami</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input
                required
                type="tel"
                placeholder="998XXXXXXXXX"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:bg-blue-50/30 transition-all placeholder:font-normal placeholder:opacity-30"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black px-1 text-gray-500">Maxfiy parol</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:bg-blue-50/30 transition-all placeholder:font-normal placeholder:opacity-30"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black px-1 text-gray-500">Filial</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm appearance-none focus:outline-none focus:bg-blue-50/30 transition-all"
                    value={formData.branch}
                    onChange={e => setFormData({...formData, branch: e.target.value})}
                  >
                    <option value="">Filialni tanlang</option>
                    <option value="Kokand">Qo'qon</option>
                    <option value="Dangara">Dang'ara</option>
                    <option value="Uchkoprik">Uchko'prik</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black px-1 text-gray-500">Yosh toifasi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-sm appearance-none focus:outline-none focus:bg-blue-50/30 transition-all"
                    value={formData.ageCategory}
                    onChange={e => setFormData({...formData, ageCategory: e.target.value})}
                  >
                    <option value="">Kategoriyani tanlang</option>
                    <option value="junior">Kichik (7-14)</option>
                    <option value="adult">Katta (14-17)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center mt-2">Xatolik: {error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-15 bento-button bg-black text-white hover:bg-gray-900 transition-all flex items-center justify-center gap-3 text-sm mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isLogin ? 'Kirish' : "Ro'yxatdan o'tish"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:underline"
          >
            {isLogin ? "Ro'yxatdan o'tmaganmisiz? Ro'yxatdan o'tish" : "Hisobingiz bormi? Kirish"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
