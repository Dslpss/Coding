"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { FaSearch, FaSignOutAlt, FaBell } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import MeusCursos from "./MeusCursos";
import NavigationMenu from "./NavigationMenu";
import UserStats from "./UserStats";
import BlogPostsDashboard from "./BlogPostsDashboard";

export default function Dashboard() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-white text-xl animate-pulse">
        Carregando...
      </div>
    );

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        Você precisa estar logado.{" "}
        <Link href="/auth" className="underline text-blue-200 ml-2">
          Login
        </Link>
      </div>
    );

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 p-4 md:p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="flex items-center bg-blue-800 text-white px-4 py-2 rounded-lg">
            <Link href="/" className="font-bold text-xl">
              SelfCoding
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center bg-blue-800/50 rounded-full px-4 py-2 flex-1 mx-8">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Pesquisar cursos, tópicos..."
            className="bg-transparent border-none text-white w-full focus:outline-none placeholder-gray-400"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 bg-blue-800/50 rounded-full text-white hover:bg-blue-700/50">
            <FaBell />
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
          <div className="flex items-center">
            <div className="bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="ml-2 hidden md:block">
              <div className="text-sm font-medium text-white">
                {user.displayName || user.email?.split("@")[0]}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-1/4">
          <NavigationMenu />
        </div>

        {/* Main Content */}
        <div className="md:w-2/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">
              Bem-vindo(a),{" "}
              <span className="text-blue-300">
                {user.displayName || user.email?.split("@")[0]}
              </span>
            </h1>
            <p className="text-blue-200">Continue seus estudos de onde parou</p>
          </div>

          <div className="mb-6">
            <MeusCursos />
          </div>

          <div className="mb-6">
            <BlogPostsDashboard />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/cursos"
              className="bg-blue-800/30 hover:bg-blue-800/50 rounded-lg p-4 flex items-center transition-all duration-200"
            >
              <div className="bg-blue-600 p-3 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Cursos</h3>
                <p className="text-blue-200 text-sm">
                  Explorar todos os cursos
                </p>
              </div>
            </Link>

            <Link
              href="/progresso"
              className="bg-blue-800/30 hover:bg-blue-800/50 rounded-lg p-4 flex items-center transition-all duration-200"
            >
              <div className="bg-blue-600 p-3 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Progresso</h3>
                <p className="text-blue-200 text-sm">Acompanhar sua evolução</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:w-1/4">
          <UserStats />

          <div className="mt-6 bg-blue-800/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Acesso Rápido</h2>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/cursos"
                className="bg-blue-700/30 hover:bg-blue-700/50 p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-300 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="text-blue-100 text-sm">Cursos</span>
              </Link>

              <Link
                href="/progresso"
                className="bg-blue-700/30 hover:bg-blue-700/50 p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-300 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="text-blue-100 text-sm">Progresso</span>
              </Link>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-700 text-white font-semibold rounded-lg py-2 px-4 transition-all duration-200"
            >
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
