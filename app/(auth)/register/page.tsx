import type { Metadata } from "next";
import AuthSplitPanel from "@/components/auth/AuthSplitPanel";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account — InCloud",
  description: "Set up your personal InCloud private storage account.",
};

export default function RegisterPage() {
  return (
    <AuthSplitPanel
      heading="Create your cloud."
      subheading="Set up your personal, private cloud storage in minutes."
    >
      <RegisterForm />
    </AuthSplitPanel>
  );
}
