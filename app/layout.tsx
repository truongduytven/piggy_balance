import type { Metadata, Viewport } from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import { FinanceProvider } from './context/FinanceContext';
import { DesktopGuard } from './components/DesktopGuard';
import { PasswordGate } from './components/PasswordGate';

const quicksand = Quicksand({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFDF8',
};

export const metadata: Metadata = {
  title: 'Cozy Money • Quản lý tiền nhẹ nhàng',
  description: 'Cuốn sổ tài chính cá nhân xinh xắn cùng trợ lý ảo Cozy.',
  icons: {
    icon: [
      { url: '/images/piggy.jpg', type: 'image/jpeg' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/piggy.jpg',
    apple: '/images/piggy.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={quicksand.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/piggy.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/piggy.jpg" />
        <link rel="apple-touch-icon" href="/images/piggy.jpg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('cozy_money_theme_mode');if(m==='dark'||(!m&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}var c=localStorage.getItem('cozy_money_color_theme');if(c){document.documentElement.setAttribute('data-color-theme',c);}else{document.documentElement.setAttribute('data-color-theme','green');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FFFDF8] text-[#3D405B] antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <PasswordGate>
            <FinanceProvider>
              <DesktopGuard>{children}</DesktopGuard>
            </FinanceProvider>
          </PasswordGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
