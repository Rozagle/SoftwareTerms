import React, { useState, useEffect, useMemo } from 'react';
import TermInput from './components/TermInput';
import DictionaryDisplay from './components/DictionaryDisplay';
import Header from './components/Header';
import AuthModal from './components/LoginModal';
import { generateDictionary } from './services/geminiService';
import { GroupedTerms, LoadingState, TermEntry, User } from './types';
import { Trash2, AlertTriangle, XCircle } from 'lucide-react';

const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [allEntries, setAllEntries] = useState<TermEntry[]>([]);
  // Removed separate groupedTerms state to prevent sync issues
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string[]>([]);
  
  // Auth & Modal States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Group terms logic - Memoized to update automatically when allEntries changes
  const groupedTerms = useMemo(() => {
    return allEntries.reduce((acc, term) => {
      const category = term.category || 'Genel';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(term);
      return acc;
    }, {} as GroupedTerms);
  }, [allEntries]);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUserStr = localStorage.getItem('devterm_current_user');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      setUser(savedUser);
      loadUserData(savedUser.email);
    }
  }, []);

  const saveDataToLocalStorage = (email: string, entries: TermEntry[]) => {
    localStorage.setItem(`devterm_data_${email}`, JSON.stringify(entries));
  };

  const loadUserData = (email: string) => {
    const savedData = localStorage.getItem(`devterm_data_${email}`);
    if (savedData) {
      try {
        const parsedEntries: TermEntry[] = JSON.parse(savedData);
        setAllEntries(parsedEntries);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
        setAllEntries([]);
    }
  };

  const handleLoginSuccess = (email: string, username: string) => {
    const newUser: User = { username, email };
    setUser(newUser);
    localStorage.setItem('devterm_current_user', JSON.stringify(newUser));
    setIsAuthModalOpen(false);
    loadUserData(email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('devterm_current_user');
    setAllEntries([]);
    setWarningMsg([]);
  };

  const handleGenerate = async (inputTerms: string) => {
    if (!user) {
        setIsAuthModalOpen(true);
        return;
    }

    setLoadingState('loading');
    setErrorMsg(null);
    setWarningMsg([]);

    try {
      const result = await generateDictionary(inputTerms);

      // Handle Rejected Terms (Warnings)
      if (result.rejectedTerms && result.rejectedTerms.length > 0) {
        setWarningMsg(result.rejectedTerms);
      }

      setAllEntries(prevEntries => {
        // De-duplication
        const existingKeys = new Set(prevEntries.map(entry => entry.term.toLowerCase()));
        const uniqueNewResults = result.validTerms.filter(
          item => !existingKeys.has(item.term.toLowerCase())
        );

        if (uniqueNewResults.length === 0) return prevEntries;

        const updatedEntries = [...uniqueNewResults, ...prevEntries];
        
        if (user) {
          saveDataToLocalStorage(user.email, updatedEntries);
        }

        return updatedEntries;
      });

      setLoadingState('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
      setLoadingState('error');
    }
  };

  const handleClearDictionary = () => {
    // Confirmation dialog
    if (window.confirm("Tüm listeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      setAllEntries([]);
      setLoadingState('idle');
      setWarningMsg([]);
      if (user) {
        saveDataToLocalStorage(user.email, []);
      }
    }
  };

  const handleDeleteTerm = (termToDelete: string) => {
    if (window.confirm(`"${termToDelete}" terimini silmek istediğinize emin misiniz?`)) {
      setAllEntries(prevEntries => {
        const updatedEntries = prevEntries.filter(entry => entry.term !== termToDelete);
        
        if (user) {
          saveDataToLocalStorage(user.email, updatedEntries);
        }
        return updatedEntries;
      });
    }
  };

  const handleDownload = () => {
    if (allEntries.length === 0) return;
    const categories = Object.keys(groupedTerms).sort();
    let content = `DEVTERM SÖZLÜĞÜ - DIŞA AKTARIM\nOluşturulma Tarihi: ${new Date().toLocaleDateString()}\n`;
    content += `Kullanıcı: ${user?.username || 'Misafir'}\n`;
    content += `=================================================\n\n`;

    categories.forEach(category => {
      content += `## ${category.toUpperCase()}\n`;
      content += `-------------------------------------------\n`;
      const termsInCategory = [...groupedTerms[category]].sort((a, b) => a.term.localeCompare(b.term));
      termsInCategory.forEach(item => {
        const fullFormStr = (item.fullForm && item.fullForm.toLowerCase() !== item.term.toLowerCase()) ? ` (${item.fullForm})` : '';
        content += `• ${item.term}${fullFormStr}\n  > ${item.definition}\n\n`;
      });
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DevTerm_${user?.username || 'Sozluk'}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 pb-20">
      
      <Header 
        user={user}
        entryCount={allEntries.length}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={handleLogout}
        onDownloadClick={handleDownload}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Yazılım Terimleri <br/>
            <span className="text-indigo-600">Akıllı Sözlüğü</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            {user ? (
              <span>Hoşgeldin <span className="font-semibold text-indigo-700">{user.username}</span>! Sözlüğün hazır.</span>
            ) : (
              "Karmaşık teknik terimleri kategorize edin ve anında öğrenin. Başlamak için lütfen giriş yapın."
            )}
          </p>
        </div>

        <TermInput 
            onGenerate={handleGenerate} 
            isLoading={loadingState === 'loading'} 
            isAuthenticated={!!user}
            onLoginRequest={() => setIsAuthModalOpen(true)}
        />

        {/* Warning State for Non-Tech Terms */}
        {warningMsg.length > 0 && (
          <div className="w-full max-w-3xl mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Bazı kelimeler eklenemedi:</p>
              <p className="text-sm mt-1">
                Şu kelimeler yazılım veya bilgisayar teknolojisi ile alakalı bulunmadığı için listeye alınmadı: <br/>
                <span className="font-mono font-bold">{warningMsg.join(', ')}</span>
              </p>
            </div>
            <button onClick={() => setWarningMsg([])} className="ml-auto text-amber-500 hover:text-amber-700">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Error State */}
        {loadingState === 'error' && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {errorMsg}
          </div>
        )}

        {/* Clear Button - Fixed positioning and z-index */}
        {allEntries.length > 0 && (
          <div className="w-full max-w-5xl flex justify-end mt-8 mb-4 px-2">
            <button
              onClick={handleClearDictionary}
              className="flex items-center gap-2 text-sm text-red-600 bg-white hover:bg-red-50 px-4 py-2 rounded-lg shadow-sm border border-red-100 hover:border-red-200 transition-all z-10 hover:shadow-md active:scale-95"
              title="Tüm listeyi temizle"
            >
              <Trash2 className="w-4 h-4" />
              Tüm Listeyi Sıfırla
            </button>
          </div>
        )}

        {/* Results Section */}
        <DictionaryDisplay groupedTerms={groupedTerms} onDeleteTerm={handleDeleteTerm} />

        {/* Empty State / Prompt */}
        {allEntries.length === 0 && loadingState !== 'loading' && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl opacity-50">
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-slate-800">Giriş Yap</h3>
              <p className="text-sm text-slate-500 mt-2">Hesabınızla oturum açın</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-slate-800">Analiz Edin</h3>
              <p className="text-sm text-slate-500 mt-2">Gemini kategorize etsin</p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-slate-800">Sonuçları Alın</h3>
              <p className="text-sm text-slate-500 mt-2">Detaylı sözlüğünüz hazır</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;