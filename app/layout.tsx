import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Rootstock — AI-Powered Homesteading',
    template: '%s · Rootstock',
  },
  description: 'Expert DIY instructions, tool lists, and pro-contractor referrals for every homestead project.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="bg-[#F7F4EE] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}