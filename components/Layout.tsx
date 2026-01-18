
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  GitBranch, 
  Settings, 
  Terminal, 
  Menu, 
  X,
  Database
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Search },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'jobs', label: 'Jobs Center', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile/iPad Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">IPv4 Deal OS</h1>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all
                  ${activePage === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@ipv4os.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-lg font-bold text-slate-800 lg:ml-0 ml-4 capitalize">
            {activePage.replace('-', ' ')}
          </h2>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Engine Active
            </div>
            <button className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
