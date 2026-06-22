import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduTrack SaaS Platform',
  description: 'Independent Multi-Tenant School & College Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
