import React, { useState } from 'react';
import { Sparkles, ArrowRight, Eraser, Lock } from 'lucide-react';

interface TermInputProps {
  onGenerate: (terms: string) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  onLoginRequest: () => void;
}

const TermInput: React.FC<TermInputProps> = ({ onGenerate, isLoading, isAuthenticated, onLoginRequest }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
      
      {/* Auth Guard Overlay */}
      {!isAuthenticated && (
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-indigo-100 max-w-sm w-full transform transition-all hover:scale-105">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Giriş Yapmalısınız</h3>
            <p className="text-slate-500 text-sm mb-6">
              Sözlük oluşturmak ve kaydetmek için lütfen hesabınıza giriş yapın veya kayıt olun.
            </p>
            <button
              onClick={onLoginRequest}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 transition-all"
            >
              Giriş Yap / Kayıt Ol
            </button>
          </div>
        </div>
      )}

      <div className={`p-6 md:p-8 ${!isAuthenticated ? 'filter blur-sm select-none' : ''}`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Terimleri Girin
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Analiz etmek istediğiniz yazılım terimlerini aşağıya yazın (virgül veya yeni satır ile ayırın).
            <br />
            <span className="text-xs text-indigo-500 font-medium">Örn: React, Docker, CI/CD, SQL, API</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading || !isAuthenticated}
            placeholder="Terimleri buraya yapıştırın..."
            className="w-full h-40 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-700 placeholder-slate-400 leading-relaxed outline-none"
          />
          
          <div className="mt-4 flex items-center justify-between">
             <button
              type="button"
              onClick={() => setText('')}
              className="text-slate-400 hover:text-red-500 text-sm flex items-center gap-1 transition-colors px-2 py-1 rounded"
              disabled={isLoading || !text || !isAuthenticated}
            >
              <Eraser className="w-4 h-4" />
              Temizle
            </button>

            <button
              type="submit"
              disabled={isLoading || !text.trim() || !isAuthenticated}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-lg shadow-indigo-200
                transition-all duration-300 transform active:scale-95
                ${isLoading || !text.trim() || !isAuthenticated
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}
              `}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  Sözlük Oluştur
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TermInput;