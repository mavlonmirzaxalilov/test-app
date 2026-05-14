import { LogOut, User, LayoutDashboard, Database, Trophy, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export function Navbar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'quizzes', label: 'Quizzes', icon: Home, roles: ['student', 'admin'] },
    { id: 'results', label: 'Results', icon: Trophy, roles: ['student', 'admin'] },
    { id: 'admin-users', label: 'Users', icon: User, roles: ['admin'] },
    { id: 'admin-quizzes', label: 'Tests', icon: Database, roles: ['admin'] },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-[#F4F7F5] z-50 px-6 flex items-center justify-center pt-4">
      <div className="w-full max-w-7xl bg-white border-2 border-black rounded-xl p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 border-2 border-black rounded-lg flex items-center justify-center text-white font-black text-xl">
            E
          </div>
          <h1 className="text-xl font-black italic tracking-tighter">
            VALITEACH <span className="text-blue-600">TESTS</span>
          </h1>
          
          <div className="hidden md:flex gap-1 ml-8 h-10 p-1 bg-gray-100 rounded-lg border-2 border-black/5">
            {navItems.filter(item => item.roles.includes(user?.role || '')).map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "px-4 rounded-md flex items-center gap-2 font-mono text-[10px] uppercase font-black transition-all",
                  activeTab === item.id 
                    ? "bg-black text-white" 
                    : "hover:bg-black/5"
                )}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end border-r-2 border-black/10 pr-4">
            <span className="text-[10px] font-black uppercase text-gray-400">Tizimda</span>
            <span className="text-sm font-black italic">{user?.name} {user?.surname}</span>
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 border-2 border-black rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
