"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import RichTextEditor from "../RichTextEditor";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function NovoPost() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/auth");
    } else if (user) {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/blog")}
            className="flex items-center gap-2 text-blue-300 hover:text-blue-100 mb-4"
          >
            <FaArrowLeft />
            Voltar para Blog
          </button>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-white">Nova Postagem</h1>
            <p className="text-blue-100 mt-2">
              Compartilhe seu conhecimento com a comunidade
            </p>
          </div>
        </div>

        {/* Editor com fundo transparente para o estilo do site */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
          <RichTextEditor />
        </div>
      </div>
    </div>
  );
}
