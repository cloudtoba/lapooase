import type { Metadata } from "next";
import { LoginPanel } from "@/components/LoginPanel";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to Lapo Oase with GitHub using Supabase Authentication."
};

export default function LoginPage() {
  return <LoginPanel />;
}
