"use client";

import { useEffect, useState } from 'react';
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
import OAuthButtons from './OAuthButtons';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, { message: 'Display name must be at least 2 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, signUp, error, clearError, user, isLoading: authLoading } = useAuthStore();
  
  const isLogin = type === 'login';
  const schema = isLogin ? loginSchema : signupSchema;

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, authLoading, router]);
  
  
  const form = useForm<LoginFormValues | SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: isLogin 
      ? { email: '', password: '' }
      : { email: '', password: '', displayName: '', confirmPassword: '' },
  });
  
  const onSubmit = async (data: LoginFormValues | SignupFormValues) => {
    clearError();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login((data as LoginFormValues).email, (data as LoginFormValues).password);
        router.push('/chat');
      } else {
        await signUp(
          (data as SignupFormValues).email,
          (data as SignupFormValues).password,
          (data as SignupFormValues).displayName
        );
        toast({
          title: 'Account created',
          description: 'Please check your email for verification',
        });
        router.push('/auth/verify-email');
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication error',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg border border-border">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-muted-foreground">
          {isLogin 
            ? 'Enter your credentials to access your account' 
            : 'Fill in the form below to create your account'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isLogin && (
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
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
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isLogin && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <OAuthButtons />
      
      <div className="text-center text-sm">
        {isLogin ? (
          <>
            Don't have an account?{' '}
            <Button variant="link" className="p-0" onClick={() => router.push('/signup')}>
              Sign up
            </Button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Button variant="link" className="p-0" onClick={() => router.push('/login')}>
              Sign in
            </Button>
          </>
        )}
      </div>
      
      {isLogin && (
        <div className="text-center text-sm">
          <Button 
            variant="link" 
            className="p-0" 
            onClick={() => router.push('/auth/reset-password')}
          >
            Forgot your password?
          </Button>
        </div>
      )}
    </div>
  );
}