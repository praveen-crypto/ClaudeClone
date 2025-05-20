"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useAuthStore from '@/store/useAuthStore';

const resetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function PasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { resetUserPassword, clearError } = useAuthStore();
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });
  
  const onSubmit = async (data: ResetFormValues) => {
    clearError();
    setIsLoading(true);
    
    try {
      await resetUserPassword(data.email);
      setResetSent(true);
      toast({
        title: 'Reset email sent',
        description: 'Check your inbox for password reset instructions',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (resetSent) {
    return (
      <div className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg border border-border">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">
            Check your email
          </h1>
          <p className="text-muted-foreground">
            We've sent password reset instructions to your email address.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button className="w-full" onClick={() => router.push('/login')}>
            Return to login
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setResetSent(false);
              form.reset();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg border border-border">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a reset link
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset email...
              </>
            ) : (
              'Send reset email'
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        <Button 
          variant="link" 
          className="p-0" 
          onClick={() => router.push('/login')}
        >
          Back to login
        </Button>
      </div>
    </div>
  );
}