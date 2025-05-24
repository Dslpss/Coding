"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaBookOpen,
  FaNewspaper,
  FaTags,
  FaSearch,
  FaGlobe,
  FaUser,
} from "react-icons/fa";

export default function BlogMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 shadow-lg">
      <div className="p-5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white flex items-center justify-center">
            <span className="mr-2">Blog SelfCoding</span>
          </h2>
          <p className="text-blue-200 text-sm mt-1">
            Conhecimento compartilhado
          </p>
        </div>
      </div>

      <div className="p-2">
        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/blog")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaNewspaper className="text-white mr-3" />
          <Link href="/blog" className="text-white flex-1">
            Todos os Posts
          </Link>
          {isActive("/blog") && (
            <span className="bg-blue-500 text-xs px-2 py-1 rounded">Atual</span>
          )}
        </div>

        <div
          className={`flex items-center p-3 mb-2 ${
            isActive("/blog/categorias")
              ? "bg-blue-700 rounded-lg"
              : "hover:bg-blue-700/60 rounded-lg transition-colors duration-200"
          }`}
        >
          <FaTags className="text-white mr-3" />
          <Link href="/blog/categorias" className="text-white flex-1">
            Categorias
          </Link>
        </div>

        <div className="px-3 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar posts..."
              className="w-full bg-blue-900/50 text-white placeholder-blue-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <FaSearch className="absolute left-3 top-3 text-blue-300" />
          </div>
        </div>

        <div className="border-t border-blue-700/50 mt-4 pt-4">
          <div
            className={`flex items-center p-3 mb-2 hover:bg-blue-700/60 rounded-lg transition-colors duration-200`}
          >
            <FaHome className="text-white mr-3" />
            <Link href="/dashboard" className="text-white flex-1">
              Dashboard
            </Link>
          </div>

          <div
            className={`flex items-center p-3 mb-2 hover:bg-blue-700/60 rounded-lg transition-colors duration-200`}
          >
            <FaBookOpen className="text-white mr-3" />
            <Link href="/cursos" className="text-white flex-1">
              Cursos
            </Link>
          </div>
        </div>

        <div className="mt-8 p-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-center transition-all duration-200">
          <Link
            href="#"
            className="text-white flex items-center justify-center font-medium"
          >
            <FaGlobe className="mr-2" />
            Plataforma online
          </Link>
        </div>
      </div>
    </div>
  );
}
