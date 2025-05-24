"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBookOpen,
  FaUsers,
  FaNewspaper,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

interface AdminSidebarProps {
  handleLogout: () => Promise<void>;
  userEmail?: string | null;
}

export default function AdminSidebar({
  handleLogout,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-blue-900 to-purple-900">
        <h2 className="text-xl font-bold flex items-center justify-between">
          <span>Painel Admin</span>
        </h2>
        <div className="mt-2 text-sm bg-black/30 rounded-lg p-2 truncate">
          {userEmail || "admin@selfcoding.com"}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 flex-1">
        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/admin")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-gray-700/50 rounded-lg"
          }`}
        >
          <FaHome className="text-gray-300 mr-3" />
          <Link href="/admin" className="text-gray-200 flex-1">
            Dashboard
          </Link>
          {isActive("/admin") && (
            <span className="bg-blue-800 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/admin/cursos")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-gray-700/50 rounded-lg"
          }`}
        >
          <FaBookOpen className="text-gray-300 mr-3" />
          <Link href="/admin/cursos" className="text-gray-200 flex-1">
            Cursos
          </Link>
          {isActive("/admin/cursos") && (
            <span className="bg-blue-800 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/admin/usuarios")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-gray-700/50 rounded-lg"
          }`}
        >
          <FaUsers className="text-gray-300 mr-3" />
          <Link href="/admin/usuarios" className="text-gray-200 flex-1">
            Usuários
          </Link>
          {isActive("/admin/usuarios") && (
            <span className="bg-blue-800 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/admin/blog")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-gray-700/50 rounded-lg"
          }`}
        >
          <FaNewspaper className="text-gray-300 mr-3" />
          <Link href="/admin/blog" className="text-gray-200 flex-1">
            Blog
          </Link>
          {isActive("/admin/blog") && (
            <span className="bg-blue-800 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/admin/configuracoes")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-gray-700/50 rounded-lg"
          }`}
        >
          <FaCog className="text-gray-300 mr-3" />
          <Link href="/admin/configuracoes" className="text-gray-200 flex-1">
            Configurações
          </Link>
          {isActive("/admin/configuracoes") && (
            <span className="bg-blue-800 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-3 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-all duration-200"
        >
          <FaSignOutAlt className="mr-2" />
          Sair
        </button>
      </div>
    </div>
  );
}
