"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { checkAdminStatus } from "../../utils/adminUtils";
import BlogEditor from "../components/BlogEditor";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function AdminNovoPost() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      if (user?.email) {
        const adminStatus = await checkAdminStatus(user.email);
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          router.push("/admin");
        }
      } else {
        router.push("/admin/login");
      }
      setLoading(false);
    };

    if (user !== undefined) {
      verifyAdmin();
    }
  }, [user, router]);

  const handleSave = () => {
    router.push("/admin/blog");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <div className="font-semibold">Acesso Negado</div>
        <div>Você não tem permissões de administrador.</div>
      </div>
    );
  }
  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 p-8 rounded-md">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/admin/blog")}
              className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
            >
              <FaArrowLeft />
              Voltar para Blog
            </button>
            <h1 className="text-3xl font-bold text-white">Criar Novo Post</h1>
            <p className="text-blue-100 mt-2">
              Crie um novo post para o blog com suporte a imagens e vídeos
            </p>
          </div>

          {/* Editor */}
          <BlogEditor onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
