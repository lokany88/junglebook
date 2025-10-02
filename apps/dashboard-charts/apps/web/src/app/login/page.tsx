'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginPageContent() {
  const params = useSearchParams();
  const token = params.get('token');

  return (
    <div>
      <h1>Login Page</h1>
      {token && <p>Logging you in with token: {token}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
