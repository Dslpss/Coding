"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState<{
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se a sessão é válida através da API
    const validateSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/verify", {
          credentials: "include", // Incluir cookies
        });
        if (response.ok) {
          const data = await response.json();
          // Usar o email retornado pela API
          setAdminData({
            email: data.email || "admin@exemplo.com",
            role: data.role,
          });
        } else {
          // Se a API retornar erro, redirecionar para login
          router.push("/admin-login");
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        router.push("/admin-login");
        return;
      }

      setLoading(false);
    };

    validateSession();
  }, [router]);
  // Loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div>Verificando permissões...</div>
        </div>
      </div>
    );
  }

  // Se não tiver dados do admin, mostrar loading
  if (!adminData) {
    return null;
  }

  const handleLogout = async () => {
    // Limpar cookie de sessão via API
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erro no logout:", error);
    }
    router.push("/admin-login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex flex-col">
      {" "}
      <AdminHeader
        userEmail={adminData.email}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
        isAdmin={true}
      />
      <div className="flex-1 flex">
        <div
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 transform transition-transform duration-300 ease-in-out
            fixed lg:static top-16 bottom-0 left-0 z-40 w-64 lg:w-72
          `}
        >
          <div className="h-full overflow-y-auto">
            <AdminSidebar
              handleLogout={handleLogout}
              userEmail={adminData.email}
            />
          </div>
        </div>

        <main
          className={`
            flex-1 p-6 transition-all duration-300 ease-in-out
            ${sidebarOpen ? "lg:ml-0" : "ml-0"}
          `}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
