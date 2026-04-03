
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FinanceProvider } from '@/context/finance-context';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Universe Organizze',
  description: 'Gerenciamento financeiro futurista offline-first',
};

export const viewport: Viewport = {
  themeColor: '#5B0E8C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/universe/180/180" />
      </head>
      <body className="font-body antialiased bg-black text-foreground selection:bg-primary selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <FinanceProvider>
              <div className="relative min-h-screen overflow-hidden bg-black">
                <main className="relative z-10">
                  {children}
                </main>
              </div>
              <Toaster />
            </FinanceProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
