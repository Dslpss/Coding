"use client";
import { useState } from "react";
import { FaSearch, FaBell, FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";

interface AdminHeaderProps {
  userEmail?: string | null;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isAdmin?: boolean;
}

export default function AdminHeader({
  userEmail,
  toggleSidebar,
  isSidebarOpen,
  isAdmin = false,
}: AdminHeaderProps) {
  const [notifications] = useState(3); // Exemplo de contagem de notificações

  return (
    <header className="bg-gray-900 text-white shadow-lg p-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-3 lg:hidden text-gray-300 hover:text-white"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <Link href="/admin" className="text-xl font-bold text-blue-400">
          SelfCoding{" "}
          <span className="text-sm font-normal text-gray-400">Admin</span>
        </Link>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative mr-4">
          <FaBell className="text-gray-300 hover:text-white cursor-pointer" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {notifications}
            </span>
          )}
        </div>

        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <span className="font-bold">
              {userEmail?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>{" "}
          <div className="hidden md:flex flex-col">
            <span className="text-sm">{userEmail || "Admin"}</span>
            {isAdmin && (
              <span className="text-xs text-green-400 font-medium">
                Administrador
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
