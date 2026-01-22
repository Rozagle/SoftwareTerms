import React from 'react';
import { Code2, Cpu, Download, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  entryCount: number;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onDownloadClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  entryCount, 
  onLoginClick, 
  onLogoutClick, 
  onDownloadClick 
}) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Area */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500 leading-tight">
              DevTerm.AI
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">SMART DICTIONARY</p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          
          {/* Download Button (Only visible if there are terms) */}
          {entryCount > 0 && (
            <button
              onClick={onDownloadClick}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
              title="Sözlüğü İndir"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Sözlüğü İndir</span>
            </button>
          )}

          {/* User Section */}
          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-700">{user.username}</span>
              </div>
              <button
                onClick={onLogoutClick}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
