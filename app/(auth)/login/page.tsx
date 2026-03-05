import type { Metadata } from "next";
import AuthSplitPanel from "@/components/auth/AuthSplitPanel";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — InCloud",
  description: "Sign in to your InCloud private storage account.",
};

export default function LoginPage() {
  return (
    <AuthSplitPanel
      heading="Welcome back."
      subheading="Sign in to access your private cloud storage."
    >
      <LoginForm />
    </AuthSplitPanel>
  );
}
