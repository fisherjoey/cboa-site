import type { Metadata } from 'next'
import './globals.css'
import './tinymce-content.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthErrorHandler from '@/components/AuthErrorHandler'

export const metadata: Metadata = {
  title: 'Calgary Basketball Officials Association',
  description: 'Official website of the Calgary Basketball Officials Association (CBOA) - Join our team of certified basketball referees',
  keywords: 'basketball, referee, officials, Calgary, CBOA, officiating, sports',
  icons: {
    icon: [
      {
        url: '/images/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/images/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/images/icons/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      }
    ],
    apple: {
      url: '/images/icons/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
    other: [
      {
        rel: 'android-chrome',
        url: '/images/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome',
        url: '/images/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ]
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/icons/favicon-16x16.png" />
        <link rel="manifest" href="/images/icons/site.webmanifest" />
        <link rel="shortcut icon" href="/images/icons/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthErrorHandler />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}