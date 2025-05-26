"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAdminAuthenticated,
  getAdminSession,
  logoutAdmin,
  renewAdminSession,
} from "./utils/adminAuth";
import "../globals.css";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const router = useRouter();
  useEffect(() => {
    const validateAdmin = async () => {
      console.log("🔍 Validando admin no layout...");
      
      // Verifica se admin está autenticado
      const authenticated = isAdminAuthenticated();
      console.log("🔐 Admin autenticado:", authenticated);
      
      if (!authenticated) {
        console.log("❌ Admin não autenticado, redirecionando para login...");
        router.push("/admin/login");
        return;
      }

      // Obter dados da sessão admin
      console.log("📋 Obtendo dados da sessão...");
      const session = getAdminSession();
      console.log("👤 Sessão admin:", session);
      
      if (session) {
        setAdminEmail(session.email);
        setIsAdmin(true);
        console.log("✅ Admin validado:", session.email);

        // Renovar sessão para manter ativa
        renewAdminSession();
        console.log("🔄 Sessão renovada");
      } else {
        console.log("❌ Sessão inválida, redirecionando...");
        router.push("/admin/login");
      }

      console.log("✅ Validação concluída, parando loading...");
      setChecking(false);
    };
    validateAdmin();
  }, [router]);
  // Loading enquanto verifica autenticação
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div>Verificando permissões...</div>
        </div>
      </div>
    );
  }

  // Se não for admin, retorna nulo e deixa o redirecionamento acontecer
  if (!isAdmin) {
    return null;
  }
  const handleLogout = async () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 flex flex-col">
      {" "}
      <AdminHeader
        userEmail={adminEmail}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={sidebarOpen}
        isAdmin={isAdmin}
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
            <AdminSidebar handleLogout={handleLogout} userEmail={adminEmail} />
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
