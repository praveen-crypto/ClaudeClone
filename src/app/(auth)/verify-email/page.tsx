"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/useAuthStore';

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const { user } = useAuthStore();
  
  useEffect(() => {
    // If user is already verified, redirect to chat
    if (user?.emailVerified) {
      router.push('/chat');
    }
    
    // Countdown for resend email button
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [user, router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg border border-border">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">
            Verify your email
          </h1>
          <p className="mt-2 text-muted-foreground">
            We've sent a verification email to{' '}
            <span className="font-medium">{user?.email}</span>.
            Please check your inbox and follow the link to verify your account.
          </p>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => router.push('/login')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}