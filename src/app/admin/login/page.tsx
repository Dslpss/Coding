"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminAuth, isAdminAuthenticated } from "../utils/adminAuth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verifica se o admin já está logado
  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace("/admin");
    }
  }, [router]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminAuth.loginAdmin(email, password);
      router.replace("/admin");
    } catch (err) {
      console.error("Erro no login admin:", err);
      setError(
        "Erro ao fazer login: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <form
        onSubmit={handleLogin}
        className="bg-white/90 p-8 rounded-lg shadow-lg flex flex-col gap-4 min-w-[320px]"
      >
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Login Admin</h2>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 text-gray-900 bg-white placeholder:text-gray-500"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded px-3 py-2 text-gray-900 bg-white placeholder:text-gray-500"
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded mt-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
