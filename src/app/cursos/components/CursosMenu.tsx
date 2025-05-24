"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBookOpen,
  FaGraduationCap,
  FaChartBar,
  FaUser,
  FaCertificate,
  FaNewspaper,
} from "react-icons/fa";

export default function CursosMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 shadow-lg">
      <div className="p-5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white flex items-center justify-center">
            <FaGraduationCap className="mr-2" />
            <span>SelfCoding</span>
          </h2>
          <p className="text-blue-200 text-sm mt-1">Cursos de Programação</p>
        </div>
      </div>

      <div className="p-2">
        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaHome className="text-white mr-3" />
          <Link href="/" className="text-white flex-1">
            Início
          </Link>
          {isActive("/") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/cursos")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaBookOpen className="text-white mr-3" />
          <Link href="/cursos" className="text-white flex-1">
            Todos os Cursos
          </Link>
          {isActive("/cursos") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/dashboard")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaUser className="text-white mr-3" />
          <Link href="/dashboard" className="text-white flex-1">
            Meus Cursos
          </Link>
          {isActive("/dashboard") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/progresso")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaChartBar className="text-white mr-3" />
          <Link href="/progresso" className="text-white flex-1">
            Meu Progresso
          </Link>
          {isActive("/progresso") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/blog")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaNewspaper className="text-white mr-3" />
          <Link href="/blog" className="text-white flex-1">
            Blog
          </Link>
          {isActive("/blog") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-blue-700">
        <div className="text-center">
          <p className="text-blue-200 text-xs">Transforme sua carreira com</p>
          <p className="text-white font-semibold text-sm">
            Programação de Qualidade
          </p>
        </div>
      </div>
    </div>
  );
}
