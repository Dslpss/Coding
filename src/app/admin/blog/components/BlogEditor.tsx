"use client";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  FaImage,
  FaVideo,
  FaEye,
  FaEyeSlash,
  FaTags,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import MarkdownRenderer from "./MarkdownRenderer";

interface PostFormFields {
  title: string;
  content: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string;
  published: boolean;
}

interface BlogEditorProps {
  initialData?: {
    title?: string;
    content?: string;
    summary?: string;
    imageUrl?: string;
    videoUrl?: string;
    tags?: string[];
    published?: boolean;
  };
  postId?: string;
  onSave?: () => void;
}

export default function BlogEditor({
  initialData,
  postId,
  onSave,
}: BlogEditorProps) {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");
  const [videoPreview, setVideoPreview] = useState(initialData?.videoUrl || "");
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormFields>({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      summary: initialData?.summary || "",
      imageUrl: initialData?.imageUrl || "",
      videoUrl: initialData?.videoUrl || "",
      tags: initialData?.tags?.join(", ") || "",
      published: initialData?.published || false,
    },
  });

  const watchedContent = watch("content");
  const watchedImageUrl = watch("imageUrl");
  const watchedVideoUrl = watch("videoUrl");
  // Atualizar previews quando URLs mudam
  useEffect(() => {
    setImagePreview(watchedImageUrl || "");
  }, [watchedImageUrl]);

  useEffect(() => {
    setVideoPreview(watchedVideoUrl || "");
  }, [watchedVideoUrl]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const onSubmit: SubmitHandler<PostFormFields> = async (data) => {
    if (!user) {
      alert("Você precisa estar logado para publicar.");
      return;
    }

    setLoading(true);
    try {
      const tagsArray = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const postData = {
        title: data.title,
        slug: generateSlug(data.title),
        content: data.content,
        summary: data.summary,
        imageUrl: data.imageUrl || null,
        videoUrl: data.videoUrl || null,
        tags: tagsArray,
        published: data.published,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        updatedAt: serverTimestamp(),
      };

      if (postId) {
        // Atualizar post existente
        await updateDoc(doc(db, "blog", postId), postData);
        alert("Post atualizado com sucesso!");
      } else {
        // Criar novo post
        await addDoc(collection(db, "blog"), {
          ...postData,
          createdAt: serverTimestamp(),
        });
        alert("Post publicado com sucesso!");
        reset();
        setImagePreview("");
        setVideoPreview("");
      }

      if (onSave) onSave();
    } catch (error) {
      console.error("Erro ao salvar post:", error);
      alert("Erro ao salvar post. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = document.querySelector(
      'textarea[name="content"]'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const newValue =
        currentValue.substring(0, start) + text + currentValue.substring(end);
      setValue("content", newValue);

      // Reposicionar cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };
  const insertImage = () => {
    setShowImageModal(true);
  };

  const insertVideo = () => {
    setShowVideoModal(true);
  };

  const handleImageInsert = (url: string, altText: string = "") => {
    if (url) {
      const markdownImage = `![${altText || "Imagem"}](${url})`;
      insertAtCursor(markdownImage);
      setShowImageModal(false);
    }
  };

  const handleVideoInsert = (url: string, title: string = "") => {
    if (url) {
      const markdownVideo = `\n\n### ${
        title || "Vídeo"
      }\n[Assistir vídeo](${url})\n\n`;
      insertAtCursor(markdownVideo);
      setShowVideoModal(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 rounded-md border border-gray-700/50 bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {postId ? "Editar Post" : "Novo Post"}
        </h1>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {preview ? <FaEyeSlash /> : <FaEye />}
          {preview ? "Editar" : "Preview"}
        </button>
      </div>

      {!preview ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {" "}
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Título *
            </label>
            <input
              {...register("title", { required: "Título é obrigatório" })}
              className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500"
              placeholder="Digite o título do post"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          {/* Resumo */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Resumo *
            </label>
            <textarea
              {...register("summary", { required: "Resumo é obrigatório" })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500 resize-vertical"
              placeholder="Digite um resumo do post"
            />
            {errors.summary && (
              <p className="text-red-400 text-sm mt-1">
                {errors.summary.message}
              </p>
            )}
          </div>{" "}
          {/* URLs de mídia */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FaImage className="inline mr-2" />
                URL da Imagem de Capa
              </label>
              <input
                {...register("imageUrl")}
                type="url"
                className="w-full px-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-white/10 backdrop-blur-sm placeholder-white/60"
                placeholder="https://exemplo.com/imagem.jpg"
                onChange={(e) => setImagePreview(e.target.value)}
              />{" "}
              {imagePreview && (
                <div className="mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md border border-gray-700/50 bg-transparent"
                    onError={() => setImagePreview("")}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FaVideo className="inline mr-2" />
                URL do Vídeo
              </label>
              <input
                {...register("videoUrl")}
                type="url"
                className="w-full px-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white bg-white/10 backdrop-blur-sm placeholder-white/60"
                placeholder="https://youtube.com/watch?v=..."
              />
              {videoPreview && (
                <div className="mt-2">
                  {" "}
                  <div className="w-full h-32 bg-transparent rounded-md border border-gray-700/50 flex items-center justify-center">
                    <FaVideo className="text-white/60 text-2xl" />
                    <span className="text-white/60 ml-2 text-sm">
                      Vídeo adicionado
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>{" "}
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FaTags className="inline mr-2" />
              Tags
            </label>
            <input
              {...register("tags")}
              className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500"
              placeholder="programação, web, tutorial (separadas por vírgula)"
            />
          </div>
          {/* Ferramentas do editor */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">
                Conteúdo *
              </label>
              <button
                type="button"
                onClick={insertImage}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                title="Inserir imagem"
              >
                <FaImage />
              </button>
              <button
                type="button"
                onClick={insertVideo}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                title="Inserir vídeo"
              >
                <FaVideo />
              </button>
            </div>
            <textarea
              {...register("content", { required: "Conteúdo é obrigatório" })}
              rows={12}
              className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500 resize-vertical font-mono text-sm"
              placeholder="Digite o conteúdo do post (suporta Markdown)..."
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-1">
                {errors.content.message}
              </p>
            )}
            <p className="text-xs text-white/60 mt-1">
              Suporte a Markdown: **negrito**, *itálico*, [link](url),
              ![imagem](url)
            </p>
          </div>{" "}
          {/* Status de publicação */}
          <div className="flex items-center space-x-3">
            <input
              {...register("published")}
              type="checkbox"
              id="published"
              className="w-4 h-4 text-blue-600 border-white/30 rounded focus:ring-blue-500 bg-white/10"
            />
            <label
              htmlFor="published"
              className="text-sm font-medium text-white"
            >
              Publicar imediatamente
            </label>
          </div>
          {/* Botões de ação */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {loading ? "Salvando..." : postId ? "Atualizar" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpar
            </button>
          </div>
        </form> // Preview do post
      ) : (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-white mb-4">
            {watch("title")}
          </h1>

          {imagePreview && (
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Capa do post"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <p className="text-lg text-blue-100 mb-6">{watch("summary")}</p>

          <MarkdownRenderer content={watchedContent || ""} />

          {watch("tags") && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-2">
                {watch("tags")
                  .split(",")
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-100 text-sm rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para inserir imagem */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-transparent p-6 rounded-md w-full max-w-md border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Inserir Imagem
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Texto Alternativo (opcional)
                </label>
                <input
                  type="text"
                  id="imageAlt"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500"
                  placeholder="Descrição da imagem"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = (
                      document.getElementById("imageUrl") as HTMLInputElement
                    )?.value;
                    const alt = (
                      document.getElementById("imageAlt") as HTMLInputElement
                    )?.value;
                    handleImageInsert(url, alt);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Inserir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para inserir vídeo */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-transparent p-6 rounded-md w-full max-w-md border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Inserir Vídeo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  URL do Vídeo
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Título do Vídeo (opcional)
                </label>
                <input
                  type="text"
                  id="videoTitle"
                  className="w-full px-4 py-3 border border-gray-700/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-transparent placeholder-gray-500"
                  placeholder="Título do vídeo"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = (
                      document.getElementById("videoUrl") as HTMLInputElement
                    )?.value;
                    const title = (
                      document.getElementById("videoTitle") as HTMLInputElement
                    )?.value;
                    handleVideoInsert(url, title);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Inserir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
