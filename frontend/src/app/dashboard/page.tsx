'use client';
import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

const statusLabels: Record<string, string> = { active: 'Активна', paused: 'На паузе', stopped: 'Остановлена' };
const deliveryLabels: Record<string, string> = { email: 'Email', telegram: 'Telegram', both: 'Email + TG' };

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await tasksApi.list();
      setTasks(data);
    } catch { toast.error('Ошибка загрузки задач'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить задачу?')) return;
    try {
      await tasksApi.delete(id);
      toast.success('Задача удалена');
      load();
    } catch { toast.error('Ошибка удаления'); }
  };

  const handleToggle = async (task: any) => {
    try {
      if (task.status === 'active') {
        await tasksApi.pause(task.id);
        toast.success('Задача на паузе');
      } else {
        await tasksApi.resume(task.id);
        toast.success('Задача запущена');
      }
      load();
    } catch { toast.error('Ошибка'); }
  };

  const handleRunNow = async (id: number) => {
    try {
      await tasksApi.runNow(id);
      toast.success('Задача запущена вручную');
    } catch { toast.error('Ошибка запуска'); }
  };

  return (
    <div className="p-8">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9' } }} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Задачи мониторинга</h1>
          <p className="text-slate-400 mt-1">Управляйте задачами для сбора и доставки новостей</p>
        </div>
        <Link href="/dashboard/tasks/new" id="new-task-btn" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать задачу
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">Задач пока нет</h3>
          <p className="text-slate-400 mb-6">Создайте первую задачу мониторинга новостей</p>
          <Link href="/dashboard/tasks/new" className="btn-primary inline-block">Создать задачу</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task: any) => (
            <div key={task.id} className="card hover:border-slate-600 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white truncate">{task.name}</h3>
                    <span className={task.status === 'active' ? 'badge-active' : task.status === 'paused' ? 'badge-paused' : 'badge-stopped'}>
                      {statusLabels[task.status] || task.status}
                    </span>
                  </div>
                  {task.description && <p className="text-slate-400 text-sm mb-3 truncate">{task.description}</p>}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    {task.topic && <span>🏷 {task.topic}</span>}
                    <span>🕐 {task.schedule_interval}</span>
                    <span>📤 {deliveryLabels[task.delivery_channel] || task.delivery_channel}</span>
                    {task.use_ai && <span className="text-purple-400">✨ ИИ</span>}
                    <span>📰 {task.sources?.length || 0} источников</span>
                    {task.last_run_at && <span>⏱ Последний запуск: {new Date(task.last_run_at).toLocaleString('ru')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRunNow(task.id)}
                    className="btn-secondary text-xs px-3 py-1.5"
                    title="Запустить сейчас"
                  >▶ Запустить</button>
                  <button
                    onClick={() => handleToggle(task)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${task.status === 'active' ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' : 'bg-green-900 text-green-300 hover:bg-green-800'}`}
                  >{task.status === 'active' ? 'Пауза' : 'Запустить'}</button>
                  <Link href={`/dashboard/tasks/${task.id}/edit`} className="btn-secondary text-xs px-3 py-1.5">Изменить</Link>
                  <button onClick={() => handleDelete(task.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
