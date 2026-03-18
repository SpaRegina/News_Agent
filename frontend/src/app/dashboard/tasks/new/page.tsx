'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tasksApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const INTERVALS = [
  { value: '15m', label: '15 минут' },
  { value: '30m', label: '30 минут' },
  { value: '1h', label: '1 час' },
  { value: '3h', label: '3 часа' },
  { value: '6h', label: '6 часов' },
  { value: '12h', label: '12 часов' },
  { value: '1d', label: '1 день' },
  { value: '1w', label: '1 неделя' },
];

interface Source { name: string; url: string; source_type: 'rss' | 'website'; }

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([{ name: '', url: '', source_type: 'rss' }]);
  const [keywords, setKeywords] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', topic: '',
    schedule_interval: '1h',
    delivery_channel: 'email',
    telegram_bot_token: '', telegram_chat_id: '',
    openrouter_api_key: '', openrouter_model: 'openai/gpt-4o-mini',
    ai_system_prompt: '', ai_user_prompt: '',
    use_ai: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const addSource = () => setSources(s => [...s, { name: '', url: '', source_type: 'rss' }]);
  const removeSource = (i: number) => setSources(s => s.filter((_, idx) => idx !== i));
  const updateSource = (i: number, field: keyof Source, value: string) =>
    setSources(s => s.map((src, idx) => idx === i ? { ...src, [field]: value } : src));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tasksApi.create({
        ...form,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        exclude_keywords: excludeKeywords.split(',').map(k => k.trim()).filter(Boolean),
        email_recipients: emailRecipients.split(',').map(e => e.trim()).filter(Boolean),
        sources: sources.filter(s => s.url),
      });
      toast.success('Задача создана!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Ошибка создания задачи');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-4xl">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9' } }} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Новая задача мониторинга</h1>
        <p className="text-slate-400 mt-1">Настройте параметры сбора и доставки новостей</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основное */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">📋 Основная информация</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Название задачи *</label>
              <input id="task-name" name="name" className="input" placeholder="Мониторинг IT-новостей" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-span-2">
              <label className="label">Описание</label>
              <textarea name="description" className="input resize-none h-20" placeholder="Описание задачи..." value={form.description} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Тематика</label>
              <input name="topic" className="input" placeholder="Технологии, ИИ, стартапы..." value={form.topic} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Периодичность</label>
              <select name="schedule_interval" className="input" value={form.schedule_interval} onChange={handleChange}>
                {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ключевые слова (через запятую)</label>
              <input className="input" placeholder="ИИ, нейросеть, GPT" value={keywords} onChange={e => setKeywords(e.target.value)} />
            </div>
            <div>
              <label className="label">Исключить слова (через запятую)</label>
              <input className="input" placeholder="реклама, спам" value={excludeKeywords} onChange={e => setExcludeKeywords(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Источники */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">🌐 Источники новостей</h2>
            <button type="button" onClick={addSource} className="btn-secondary text-sm">+ Добавить</button>
          </div>
          <div className="space-y-3">
            {sources.map((src, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="label">Название</label>
                  <input className="input" placeholder="Хабр" value={src.name} onChange={e => updateSource(i, 'name', e.target.value)} />
                </div>
                <div className="flex-2 w-full">
                  <label className="label">URL</label>
                  <input className="input" placeholder="https://habr.com/rss/..." value={src.url} onChange={e => updateSource(i, 'url', e.target.value)} />
                </div>
                <div>
                  <label className="label">Тип</label>
                  <select className="input w-28" value={src.source_type} onChange={e => updateSource(i, 'source_type', e.target.value as any)}>
                    <option value="rss">RSS</option>
                    <option value="website">Сайт</option>
                  </select>
                </div>
                {sources.length > 1 && (
                  <button type="button" onClick={() => removeSource(i)} className="text-red-400 hover:text-red-300 pb-2 transition-colors">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Доставка */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">📤 Доставка новостей</h2>
          <div className="mb-4">
            <label className="label">Канал доставки</label>
            <div className="flex gap-3">
              {[{ v: 'email', l: '📧 Email' }, { v: 'telegram', l: '✈️ Telegram' }, { v: 'both', l: '📧 + ✈️ Оба' }].map(c => (
                <label key={c.v} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium ${form.delivery_channel === c.v ? 'border-blue-500 bg-blue-950 text-blue-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  <input type="radio" name="delivery_channel" value={c.v} checked={form.delivery_channel === c.v} onChange={handleChange} className="hidden" />
                  {c.l}
                </label>
              ))}
            </div>
          </div>
          {(form.delivery_channel === 'email' || form.delivery_channel === 'both') && (
            <div className="mb-4">
              <label className="label">Email адреса (через запятую)</label>
              <input className="input" placeholder="you@example.com, boss@company.com" value={emailRecipients} onChange={e => setEmailRecipients(e.target.value)} />
            </div>
          )}
          {(form.delivery_channel === 'telegram' || form.delivery_channel === 'both') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Telegram Bot Token</label>
                <input name="telegram_bot_token" className="input" placeholder="1234567890:ABC..." value={form.telegram_bot_token} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Chat ID</label>
                <input name="telegram_chat_id" className="input" placeholder="-1001234567890" value={form.telegram_chat_id} onChange={handleChange} />
              </div>
            </div>
          )}
        </div>

        {/* ИИ обработка */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">✨ ИИ обработка (OpenRouter)</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-slate-400">Включить</span>
              <div className="relative">
                <input type="checkbox" name="use_ai" checked={form.use_ai} onChange={handleChange} className="sr-only" />
                <div onClick={() => setForm(f => ({ ...f, use_ai: !f.use_ai }))} className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${form.use_ai ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.use_ai ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </div>
            </label>
          </div>
          {form.use_ai && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">OpenRouter API Key</label>
                  <input name="openrouter_api_key" className="input" placeholder="sk-or-..." value={form.openrouter_api_key} onChange={handleChange} />
                </div>
                <div>
                  <label className="label">Модель</label>
                  <input name="openrouter_model" className="input" placeholder="openai/gpt-4o-mini" value={form.openrouter_model} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="label">System Prompt (необязательно)</label>
                <textarea name="ai_system_prompt" className="input resize-none h-20" placeholder="Ты помощник для составления новостных дайджестов..." value={form.ai_system_prompt} onChange={handleChange} />
              </div>
              <div>
                <label className="label">User Prompt (необязательно)</label>
                <textarea name="ai_user_prompt" className="input resize-none h-16" placeholder="Составь краткий дайджест:" value={form.ai_user_prompt} onChange={handleChange} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" id="create-task-submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Создание...' : 'Создать задачу'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Отмена</button>
        </div>
      </form>
    </div>
  );
}
