"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/utils/auth";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const user = getSession();
    if (user) {
      router.replace("/");
    }
  }, [router]);
  return <>{children}</>;
}
