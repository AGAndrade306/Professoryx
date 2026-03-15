import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Professoryx — Prepare aulas com IA',
  description: 'App com IA que prepara aulas instantaneamente para professores, gerando planos de aula, slides e apresentações.',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg-dark text-text-primary antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f1f5f9',
              border: '1px solid #1e293b',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#66FF33',
                secondary: '#111827',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#111827',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
