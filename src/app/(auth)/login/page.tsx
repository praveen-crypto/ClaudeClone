import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <AuthForm type="login" />
    </div>
  );
}