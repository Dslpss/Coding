"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { checkAdminStatus } from "../../utils/adminUtils";
import BlogEditor from "../components/BlogEditor";
import { FaArrowLeft } from "react-icons/fa";

export default function EditarPost() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState(null);
  const postId = params.id as string;

  useEffect(() => {
    const verifyAdminAndFetchPost = async () => {
      if (user?.email) {
        const adminStatus = await checkAdminStatus(user.email);
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          router.push("/admin");
          return;
        }

        // Buscar dados do post
        try {
          const postDoc = await getDoc(doc(db, "blog", postId));
          if (postDoc.exists()) {
            setPostData({ id: postDoc.id, ...postDoc.data() });
          } else {
            alert("Post não encontrado");
            router.push("/admin/blog");
          }
        } catch (error) {
          console.error("Erro ao buscar post:", error);
          alert("Erro ao carregar post");
          router.push("/admin/blog");
        }
      } else {
        router.push("/admin/login");
      }
      setLoading(false);
    };

    if (user !== undefined) {
      verifyAdminAndFetchPost();
    }
  }, [user, router, postId]);

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

  if (!postData) {
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <div className="font-semibold">Post não encontrado</div>
        <div>O post que você está tentando editar não existe.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/blog")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Voltar para Blog
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Editar Post</h1>
          <p className="text-gray-600 mt-2">
            Edite as informações do post "{postData.title}"
          </p>
        </div>

        {/* Editor */}
        <BlogEditor
          initialData={postData}
          postId={postId}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
