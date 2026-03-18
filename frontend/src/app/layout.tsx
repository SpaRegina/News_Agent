import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Монитор новостей — ИИ-агент',
  description: 'Автоматический мониторинг, фильтрация и доставка новостей по вашим темам',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
