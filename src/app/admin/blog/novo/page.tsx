"use client";
import { useEffect, useState } from "react";
import { isAdminAuthenticated, getAdminSession } from "../../utils/adminAuth";
import BlogEditor from "../components/BlogEditor";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function AdminNovoPost() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = () => {
      // Verifica se admin está autenticado
      if (!isAdminAuthenticated()) {
        router.push("/admin-login");
        return;
      }

      setLoading(false);
    };

    verifyAdmin();
  }, [router]);

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
