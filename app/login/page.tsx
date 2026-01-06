'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Login page is deprecated - redirect to landing page
// Authentication is now handled directly from the landing page
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
