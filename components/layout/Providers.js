'use client';

import { AuthProvider } from '../../lib/auth';
import Navbar from './Navbar';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      <main>{children}</main>
    </AuthProvider>
  );
}
