'use client';
import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusLabels: Record<string, { label: string; cls: string }> = {
  success: { label: '✅ Успешно', cls: 'text-green-400' },
  failed: { label: '❌ Ошибка', cls: 'text-red-400' },
  running: { label: '⏳ Выполняется', cls: 'text-yellow-400' },
  partial: { label: '⚠️ Частично', cls: 'text-orange-400' },
};

export default function HistoryPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [runs, setRuns] = useState<Record<number, any[]>>({});
  const [openTask, setOpenTask] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksApi.list().then(r => setTasks(r.data)).catch(() => toast.error('Ошибка загрузки')).finally(() => setLoading(false));
  }, []);

  const loadRuns = async (taskId: number) => {
    if (openTask === taskId) { setOpenTask(null); return; }
    setOpenTask(taskId);
    if (runs[taskId]) return;
    try {
      const { data } = await tasksApi.getRuns(taskId);
      setRuns(prev => ({ ...prev, [taskId]: data }));
    } catch { toast.error('Ошибка загрузки истории'); }
  };

  const fmt = (d: string) => d ? format(new Date(d), 'dd MMM yyyy, HH:mm', { locale: ru }) : '—';

  return (
    <div className="p-8">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9' } }} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">История запусков</h1>
        <p className="text-slate-400 mt-1">Просматривайте результаты выполнения задач</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-400">История запусков пока пуста</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="card p-0 overflow-hidden">
              <button
                onClick={() => loadRuns(task.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-750 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{openTask === task.id ? '▼' : '▶'}</span>
                  <div>
                    <p className="font-semibold text-white">{task.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.last_run_at ? `Последний запуск: ${fmt(task.last_run_at)}` : 'Ещё не запускалась'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-400'}`}>
                  {task.status === 'active' ? 'Активна' : 'На паузе'}
                </span>
              </button>

              {openTask === task.id && (
                <div className="border-t border-slate-700 px-6 py-4">
                  {!runs[task.id] ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                    </div>
                  ) : runs[task.id].length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">Запусков пока нет</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs uppercase">
                          <th className="text-left pb-2">Дата запуска</th>
                          <th className="text-left pb-2">Статус</th>
                          <th className="text-left pb-2">Найдено</th>
                          <th className="text-left pb-2">Отправлено</th>
                          <th className="text-left pb-2">Ошибка</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {runs[task.id].map((run: any) => (
                          <tr key={run.id} className="text-slate-300">
                            <td className="py-2">{fmt(run.started_at)}</td>
                            <td className={`py-2 font-medium ${statusLabels[run.status]?.cls || ''}`}>{statusLabels[run.status]?.label || run.status}</td>
                            <td className="py-2">{run.found_count}</td>
                            <td className="py-2">{run.sent_count}</td>
                            <td className="py-2 text-red-400 text-xs max-w-xs truncate">{run.error_message || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
