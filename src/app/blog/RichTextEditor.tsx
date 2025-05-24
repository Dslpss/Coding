"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaSave, FaSpinner } from "react-icons/fa";

type PostFormFields = {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  videoUrl?: string;
};

export default function RichTextEditor() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormFields>();

  const onSubmit: SubmitHandler<PostFormFields> = async (data) => {
    setLoading(true);
    try {
      await addDoc(collection(db, "blog"), {
        title: data.title,
        content: data.content,
        summary: data.summary || "",
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
        published: true,
        createdAt: serverTimestamp(),
      });
      alert("Post publicado com sucesso!");
      reset();
    } catch (e) {
      console.error("Erro ao publicar:", e);
      if (e instanceof Error) alert("Erro ao publicar: " + e.message);
      else alert("Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Criar Nova Postagem
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            {...register("title", { required: "Título é obrigatório" })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
            placeholder="Digite o título do post"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resumo
          </label>
          <textarea
            {...register("summary")}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 resize-vertical"
            placeholder="Digite um resumo do post (opcional)"
          />
        </div>

        {/* URLs de mídia */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da Imagem
            </label>
            <input
              {...register("imageUrl")}
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Vídeo
            </label>
            <input
              {...register("videoUrl")}
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo *
          </label>
          <textarea
            {...register("content", { required: "Conteúdo é obrigatório" })}
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 resize-vertical font-mono text-sm"
            placeholder="Digite o conteúdo do post..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {errors.content.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Suporte a formatação básica com quebras de linha
          </p>
        </div>

        {/* Botão de publicar */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {loading ? "Publicando..." : "Publicar"}
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Limpar
          </button>
        </div>
      </form>
    </div>
  );
}
