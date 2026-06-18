import './globals.css';
import Providers from '../components/layout/Providers';

export const metadata = {
  title: 'SignDoc - Digital Signature Platform',
  description: 'Upload, sign, and verify PDF documents electronically',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
