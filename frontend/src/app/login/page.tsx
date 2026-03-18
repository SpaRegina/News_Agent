'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await authApi.register({ email: form.email, full_name: form.full_name, password: form.password });
        toast.success('Регистрация успешна! Войдите в аккаунт.');
        setMode('login');
      } else {
        const { data } = await authApi.login(form.email, form.password);
        localStorage.setItem('token', data.access_token);
        router.replace('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9' } }} />
      <div className="w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Монитор новостей</h1>
          <p className="text-slate-400 mt-1">ИИ-агент мониторинга и доставки новостей</p>
        </div>

        {/* Форма */}
        <div className="card">
          {/* Переключатель режима */}
          <div className="flex rounded-lg bg-slate-900 p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Вход
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Имя</label>
                <input id="full_name" name="full_name" className="input" placeholder="Ваше имя" value={form.full_name} onChange={handleChange} />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input id="email" name="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Пароль</label>
              <input id="password" name="password" type="password" className="input" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" disabled={loading} id="submit-btn" className="btn-primary w-full mt-2">
              {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
