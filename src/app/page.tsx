"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/utils/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getSession();
    if (!user) {
      router.replace("/auth/sign-in");
    }
    setLoading(false);
  }, [router]);

  if (loading) return null;
  // Aquí puedes renderizar el dashboard real si hay sesión
  return <div>Bienvenido al dashboard</div>;
}
