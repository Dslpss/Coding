"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { checkAdminStatus } from "./utils/authGuard";
import "../globals.css";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateAdmin = async () => {
      // Se estiver carregando, espera
      if (loading) return; // Se não tiver usuário, redireciona
      if (!user || !user.email) {
        router.push("/admin-login");
        return;
      }

      // Se já tiver cache no localStorage, usa ele
      if (localStorage.getItem("adminStatus") === "true") {
        setIsAdmin(true);
        setChecking(false);
        return;
      }

      // Verifica no banco
      const isUserAdmin = await checkAdminStatus(user.email);

      if (isUserAdmin) {
        localStorage.setItem("adminStatus", "true");
        setIsAdmin(true);
      } else {
        localStorage.removeItem("adminStatus");
        router.push("/admin-login");
      }

      setChecking(false);
    };

    validateAdmin();
  }, [user, loading, router]);

  // Loading state
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white text-xl">
        <div className="flex flex-col items-center">
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
    await auth.signOut();
    localStorage.removeItem("adminStatus");
    localStorage.removeItem("adminLogged");
    router.push("/admin/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      <AdminHeader
        userEmail={user?.email}
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
            <AdminSidebar handleLogout={handleLogout} userEmail={user?.email} />
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
