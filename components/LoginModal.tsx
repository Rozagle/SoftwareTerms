import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle, Facebook, Info } from 'lucide-react';
import { AuthView } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, username: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Demo Mode State (Show code in UI since we have no email server)
  const [demoCodeNotification, setDemoCodeNotification] = useState<string | null>(null);

  // Timer State
  const [timer, setTimer] = useState(0);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
  
  useEffect(() => {
    if (isOpen) {
      setView('LOGIN');
      setError(null);
      setEmail('');
      setPassword('');
      setUsername('');
      setVerificationCode('');
      setTimer(0);
      setDemoCodeNotification(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- MOCK BACKEND LOGIC ---

  const simulateNetworkRequest = async () => {
    setIsLoading(true);
    setError(null);
    return new Promise(resolve => setTimeout(resolve, 1500));
  };

  const generateAndSendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    // Gerçek e-posta sunucusu olmadığı için kodu ekranda gösteriyoruz
    setDemoCodeNotification(code);
    
    return code;
  };

  const handleSendCode = async () => {
    await simulateNetworkRequest();
    generateAndSendCode();
    setIsLoading(false);
    setTimer(60); // Sayacı başlat
    return true;
  };

  const handleResendCode = async () => {
    if (timer > 0) return;
    await simulateNetworkRequest();
    generateAndSendCode();
    setIsLoading(false);
    setTimer(60); // Sayacı sıfırla
    setError(null);
    setVerificationCode('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await simulateNetworkRequest();
    
    // Check "Database"
    const users = JSON.parse(localStorage.getItem('devterm_users_db') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      onLoginSuccess(user.email, user.username);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setError('E-posta adresi veya şifre hatalı.');
    }
  };

  const handleSignupStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('devterm_users_db') || '[]');
    if (users.find((u: any) => u.email === email)) {
        setError('Bu e-posta adresi zaten kayıtlı.');
        return;
    }

    await handleSendCode();
    setView('VERIFY_EMAIL');
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await simulateNetworkRequest();
    
    if (verificationCode === generatedCode) {
      // Register User
      const users = JSON.parse(localStorage.getItem('devterm_users_db') || '[]');
      users.push({ email, username, password });
      localStorage.setItem('devterm_users_db', JSON.stringify(users));
      
      onLoginSuccess(email, username);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setError('Geçersiz doğrulama kodu.');
    }
  };

  const handleForgotPasswordStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('devterm_users_db') || '[]');
    if (!users.find((u: any) => u.email === email)) {
        setError('Bu e-posta adresine kayıtlı kullanıcı bulunamadı.');
        return;
    }

    await handleSendCode();
    setView('VERIFY_RESET');
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedCode) {
      setView('NEW_PASSWORD');
    } else {
      setError('Geçersiz doğrulama kodu.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    await simulateNetworkRequest();
    
    const users = JSON.parse(localStorage.getItem('devterm_users_db') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].password = password; // Update password
      localStorage.setItem('devterm_users_db', JSON.stringify(users));
      setIsLoading(false);
      alert('Şifreniz başarıyla güncellendi. Lütfen giriş yapın.');
      setView('LOGIN');
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    await simulateNetworkRequest();
    // Simulate getting user info from provider
    const mockEmail = `user@${provider.toLowerCase()}.com`;
    const mockName = `${provider} User`;
    onLoginSuccess(mockEmail, mockName);
    setIsLoading(false);
  };

  // --- RENDER HELPERS ---

  const renderSocialButtons = () => (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <button 
        type="button"
        onClick={() => handleOAuthLogin('Google')}
        className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </button>
      <button 
        type="button"
        onClick={() => handleOAuthLogin('Facebook')}
        className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600 text-sm font-medium"
      >
        <Facebook className="w-5 h-5 text-blue-600" />
        Facebook
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
          <X className="w-5 h-5" />
        </button>

        {/* --- VIEW: LOGIN --- */}
        {view === 'LOGIN' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Giriş Yap</h2>
            <p className="text-slate-500 text-sm mb-6">DevTerm.AI hesabınıza erişin</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-xs text-indigo-600 hover:underline">
                    Şifremi unuttum?
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all flex justify-center items-center"
              >
                {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Giriş Yap'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">veya şununla devam et</span></div>
            </div>

            {renderSocialButtons()}

            <p className="mt-6 text-center text-sm text-slate-600">
              Hesabınız yok mu? <button onClick={() => setView('SIGNUP')} className="text-indigo-600 font-medium hover:underline">Kayıt Ol</button>
            </p>
          </div>
        )}

        {/* --- VIEW: SIGNUP --- */}
        {view === 'SIGNUP' && (
          <div className="p-8">
            <button onClick={() => setView('LOGIN')} className="flex items-center gap-1 text-slate-500 text-sm mb-4 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4" /> Geri Dön
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Hesap Oluştur</h2>
            <p className="text-slate-500 text-sm mb-6">Ücretsiz kayıt olun</p>

            <form onSubmit={handleSignupStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all flex justify-center items-center"
              >
                {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Kayıt Ol'}
              </button>
            </form>
            
            <div className="mt-4">
              {renderSocialButtons()}
            </div>
          </div>
        )}

        {/* --- VIEW: VERIFY EMAIL (COMMON) --- */}
        {(view === 'VERIFY_EMAIL' || view === 'VERIFY_RESET') && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">E-postanızı Kontrol Edin</h2>
            <p className="text-slate-500 text-sm mb-6">
              <span className="font-semibold text-slate-700">{email}</span> adresine 6 haneli bir doğrulama kodu gönderdik.
            </p>

            {/* DEMO MODE NOTIFICATION - Replacing Alert */}
            {demoCodeNotification && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-left flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <Info className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-sm mb-1 text-amber-800">Demo Modu Bildirimi</p>
                  <p className="text-sm text-amber-700 mb-2">Gerçek e-posta servisi bağlı olmadığı için kodunuz aşağıdadır:</p>
                  <div className="bg-white border border-amber-200 rounded px-3 py-1.5 font-mono text-lg font-bold tracking-widest text-center text-slate-800 select-all cursor-text">
                    {demoCodeNotification}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={view === 'VERIFY_EMAIL' ? handleVerifySignup : handleVerifyReset} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  maxLength={6}
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl font-bold tracking-widest py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none text-indigo-600"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium rounded-lg shadow-md transition-all flex justify-center items-center gap-2"
              >
                {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : (
                    <>Doğrula <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-sm">
                <span className="text-slate-500">Kod gelmedi mi? </span>
                <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={timer > 0 || isLoading}
                    className={`font-medium transition-colors ${
                        timer > 0 
                        ? 'text-slate-400 cursor-not-allowed' 
                        : 'text-indigo-600 hover:text-indigo-800 underline'
                    }`}
                >
                    {timer > 0 ? `Tekrar gönder (${timer}sn)` : 'Tekrar gönder'}
                </button>
            </div>

            <button onClick={() => setView('LOGIN')} className="mt-4 text-sm text-slate-400 hover:text-slate-600 block w-full">İptal</button>
          </div>
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {view === 'FORGOT_PASSWORD' && (
          <div className="p-8">
            <button onClick={() => setView('LOGIN')} className="flex items-center gap-1 text-slate-500 text-sm mb-4 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4" /> Girişe Dön
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Şifre Sıfırlama</h2>
            <p className="text-slate-500 text-sm mb-6">
              Hesabınıza bağlı e-posta adresini girin, size sıfırlama kodu gönderelim.
            </p>

            <form onSubmit={handleForgotPasswordStart} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all flex justify-center items-center"
              >
                {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Sıfırlama Kodu Gönder'}
              </button>
            </form>
          </div>
        )}

         {/* --- VIEW: NEW PASSWORD --- */}
         {view === 'NEW_PASSWORD' && (
          <div className="p-8 text-center">
             <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Yeni Şifre Oluştur</h2>
            
            <form onSubmit={handlePasswordReset} className="space-y-4 text-left mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yeni Şifre</label>
                <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="En az 6 karakter"
                    minLength={6}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all flex justify-center items-center"
              >
                {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Şifreyi Güncelle'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;