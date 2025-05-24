"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBookOpen,
  FaChartLine,
  FaNewspaper,
  FaCog,
  FaUser,
  FaGlobe,
} from "react-icons/fa";

export default function NavigationMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 shadow-lg">
      <div className="p-5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white flex items-center justify-center">
            <span className="mr-2">SelfCoding</span>
          </h2>
        </div>
      </div>

      <div className="p-2">
        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/dashboard")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700 rounded-lg"
          }`}
        >
          <FaHome className="text-white mr-3" />
          <Link href="/dashboard" className="text-white flex-1">
            Dashboard
          </Link>
          {isActive("/dashboard") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/cursos")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700 rounded-lg"
          }`}
        >
          <FaBookOpen className="text-white mr-3" />
          <Link href="/cursos" className="text-white flex-1">
            Cursos
          </Link>
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/progresso")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700 rounded-lg"
          }`}
        >
          <FaChartLine className="text-white mr-3" />
          <Link href="/progresso" className="text-white flex-1">
            Meu Progresso
          </Link>
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/blog")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700 rounded-lg"
          }`}
        >
          <FaNewspaper className="text-white mr-3" />
          <Link href="/blog" className="text-white flex-1">
            Blog
          </Link>
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/configuracoes")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700 rounded-lg"
          }`}
        >
          <FaCog className="text-white mr-3" />
          <Link href="/configuracoes" className="text-white flex-1">
            Configurações
          </Link>
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/perfil")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700 rounded-lg"
          }`}
        >
          <FaUser className="text-white mr-3" />
          <Link href="/perfil" className="text-white flex-1">
            Perfil
          </Link>
        </div>

        <div className="mt-8 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-center">
          <Link
            href="#"
            className="text-white flex items-center justify-center"
          >
            <FaGlobe className="mr-2" />
            Plataforma online
          </Link>
        </div>
      </div>
    </div>
  );
}
