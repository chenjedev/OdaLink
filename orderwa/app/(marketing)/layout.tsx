import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import './odalink-routes.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'OdaLink | WhatsApp orders, organized',
  description:
    'Take WhatsApp orders without the chaos. Customers shop from your store link, while you keep names, items, phone numbers, and totals in one place.',
  applicationName: 'OdaLink',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/odalink-mark.svg',
    apple: '/odalink-mark.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light',
  themeColor: '#f7f9fb',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
