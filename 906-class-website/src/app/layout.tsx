import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: '906 親師溝通平台',
  description: '親師合作，共創未來 | 114學年度',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
