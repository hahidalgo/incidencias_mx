"use client";
import { useRouter } from "next/navigation";
import { clearSession } from "@/utils/auth";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.push("/auth/sign-in");
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
      >
        Cerrar sesión
      </button>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4">¿Seguro que deseas cerrar sesión?</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 mr-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Sí, salir
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
