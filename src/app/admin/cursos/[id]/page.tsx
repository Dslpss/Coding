"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import AlertBanner from "../../components/AlertBanner";
import React from "react";

interface Curso {
  id: string;
  nome?: string;
  titulo?: string;
  descricao?: string;
  nivel?: string;
  preco?: number;
  imagemUrl?: string;
  createdAt?: unknown;
}

interface Capitulo {
  id: string;
  nome: string;
  videoUrl?: string;
  videoTitulo?: string;
  createdAt?: unknown;
  videos: Video[];
}

// NOVA INTERFACE PARA VÍDEOS
interface Video {
  id: string;
  titulo: string;
  url: string;
  createdAt?: unknown;
}

// Type guard para Promise
function isPromise<T>(obj: unknown): obj is Promise<T> {
  return (
    !!obj &&
    typeof obj === "object" &&
    "then" in obj &&
    typeof (obj as { then?: unknown }).then === "function"
  );
}

export default function CursoPersonalizarPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const [cursoId, setCursoId] = useState<string | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [nomeCap, setNomeCap] = useState("");
  const [videoCap, setVideoCap] = useState("");
  const [capLoading, setCapLoading] = useState(false);
  const [capError, setCapError] = useState("");
  const [capSuccess, setCapSuccess] = useState("");
  const [capSelecionado, setCapSelecionado] = useState<string>("");
  const [novoVideo, setNovoVideo] = useState("");
  const [videoMsg, setVideoMsg] = useState("");
  const [novoTituloVideo, setNovoTituloVideo] = useState("");
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    async function resolveParams() {
      if (isPromise<{ id: string }>(params)) {
        const resolved = await params;
        if (!ignore) setCursoId(resolved.id);
      } else if (
        typeof params === "object" &&
        params !== null &&
        "id" in params
      ) {
        setCursoId((params as { id: string }).id);
      }
    }
    resolveParams();
    return () => {
      ignore = true;
    };
  }, [params]);
  useEffect(() => {
    if (!cursoId) return;
    const fetchCurso = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "cursos", cursoId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCurso({ id: snap.id, ...snap.data() });
        } else {
          setError("Curso não encontrado.");
        }
      } catch {
        setError("Erro ao buscar curso.");
      }
      setLoading(false);
    };
    fetchCurso();
  }, [cursoId]);
  // Função para buscar capítulos via API
  async function fetchCapitulos() {
    if (!cursoId) return;
    setCapLoading(true);
    setCapError("");
    try {
      console.log("🔍 Buscando capítulos via API...");
      const response = await fetch(`/api/admin/courses/${cursoId}/chapters`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const capitulosComDatas = data.chapters.map((cap: any) => ({
        ...cap,
        createdAt: cap.createdAt ? new Date(cap.createdAt) : null,
        videos: cap.videos.map((video: any) => ({
          ...video,
          createdAt: video.createdAt ? new Date(video.createdAt) : null,
        })),
      }));
      setCapitulos(capitulosComDatas);
      setCapError("");
    } catch (err: any) {
      console.error("❌ Erro ao buscar capítulos:", err);
      setCapError("Erro ao buscar capítulos: " + err.message);
    } finally {
      setCapLoading(false);
    }
  }

  useEffect(() => {
    if (!cursoId) return;
    fetchCapitulos();
  }, [cursoId]);
  // Adicionar capítulo via API
  async function handleAddCapitulo(e: React.FormEvent) {
    e.preventDefault();
    setCapError("");
    setCapSuccess("");

    if (!nomeCap.trim() || !videoCap.trim() || !novoTituloVideo.trim()) {
      setCapError(
        "Preencha o nome do capítulo, o título do vídeo e o link do vídeo."
      );
      return;
    }

    setCapLoading(true);

    try {
      console.log("📝 Criando capítulo via API...");

      const response = await fetch(`/api/admin/courses/${cursoId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nome: nomeCap.trim(),
          videoTitulo: novoTituloVideo.trim(),
          videoUrl: videoCap.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar capítulo");
      }

      const data = await response.json();
      console.log("✅ Capítulo criado:", data.chapter);

      // Limpar formulário
      setNomeCap("");
      setVideoCap("");
      setNovoTituloVideo("");

      setCapSuccess("Capítulo adicionado!");
      await fetchCapitulos();
      setTimeout(() => setCapSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ Erro ao adicionar capítulo:", err);
      setCapError("Erro ao adicionar capítulo: " + err.message);
    } finally {
      setCapLoading(false);
    }
  }
  // Adicionar vídeo via API
  async function handleAddVideoToCapitulo(e: React.FormEvent) {
    e.preventDefault();
    setVideoMsg("");

    if (!capSelecionado || !novoVideo.trim() || !novoTituloVideo.trim()) {
      setVideoMsg("Selecione um capítulo, insira o título e o link do vídeo.");
      return;
    }

    setCapLoading(true);

    try {
      console.log("📹 Adicionando vídeo via API...");

      const response = await fetch(
        `/api/admin/courses/${cursoId}/chapters/${capSelecionado}/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            titulo: novoTituloVideo.trim(),
            url: novoVideo.trim(),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao adicionar vídeo");
      }

      const data = await response.json();
      console.log("✅ Vídeo adicionado:", data.video);

      // Limpar formulário
      setNovoVideo("");
      setNovoTituloVideo("");
      setCapSelecionado("");

      setVideoMsg("Vídeo adicionado ao capítulo!");

      // Forçar atualização da lista
      setCapSuccess(""); // força refresh dos capítulos

      setTimeout(() => setVideoMsg(""), 3000);
    } catch (err: any) {
      console.error("❌ Erro ao adicionar vídeo:", err);
      setVideoMsg("Erro ao adicionar vídeo: " + err.message);
    } finally {
      setCapLoading(false);
    }
  }
  // Função para apagar o curso via API
  async function handleDeleteCurso() {
    if (!cursoId) return;
    if (
      !confirm(
        "Tem certeza que deseja apagar este curso? Esta ação não pode ser desfeita."
      )
    )
      return;

    setLoading(true);
    setError("");

    try {
      console.log("🗑️ Apagando curso via API...");

      const response = await fetch(`/api/admin/courses?courseId=${cursoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao apagar curso");
      }

      setLoading(false);
      alert("Curso apagado com sucesso!");
      router.push("/admin/cursos");
    } catch (err: any) {
      console.error("❌ Erro ao apagar curso:", err);
      setError("Erro ao apagar curso: " + err.message);
      setLoading(false);
    }
  }
  // Função para editar capítulo via API
  async function handleEditarCapitulo(
    capId: string,
    novoNome: string,
    novoTitulo: string,
    novoLink: string
  ) {
    setCapLoading(true);
    setCapError("");

    try {
      console.log("📝 Editando capítulo via API...");

      const response = await fetch(`/api/admin/courses/${cursoId}/chapters`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          chapterId: capId,
          nome: novoNome,
          videoTitulo: novoTitulo,
          videoUrl: novoLink,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao editar capítulo");
      }

      console.log("✅ Capítulo editado com sucesso");
      setCapSuccess("Capítulo atualizado!");
      await fetchCapitulos();
      setTimeout(() => setCapSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ Erro ao editar capítulo:", err);
      setCapError("Erro ao editar capítulo: " + err.message);
    } finally {
      setCapLoading(false);
    }
  }
  // Função para apagar capítulo via API
  async function handleApagarCapitulo(capId: string) {
    if (!confirm("Tem certeza que deseja apagar este capítulo?")) return;
    setCapLoading(true);
    setCapError("");

    try {
      console.log("🗑️ Apagando capítulo via API...");

      const response = await fetch(
        `/api/admin/courses/${cursoId}/chapters?courseId=${cursoId}&chapterId=${capId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao apagar capítulo");
      }

      console.log("✅ Capítulo apagado com sucesso");
      setCapSuccess("Capítulo apagado!");
      await fetchCapitulos();
      setTimeout(() => setCapSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ Erro ao apagar capítulo:", err);
      setCapError("Erro ao apagar capítulo: " + err.message);
    } finally {
      setCapLoading(false);
    }
  }

  // Função para apagar vídeo via API
  async function handleApagarVideo(capId: string, videoId: string) {
    setCapLoading(true);
    setCapError("");

    try {
      console.log("🗑️ Apagando vídeo via API...");

      const response = await fetch(
        `/api/admin/courses/${cursoId}/chapters/${capId}/videos?courseId=${cursoId}&chapterId=${capId}&videoId=${videoId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao apagar vídeo");
      }

      console.log("✅ Vídeo apagado com sucesso");
      setCapSuccess("Vídeo apagado!");
      await fetchCapitulos();
      setTimeout(() => setCapSuccess(""), 3000);
    } catch (err: any) {
      console.error("❌ Erro ao apagar vídeo:", err);
      setCapError("Erro ao apagar vídeo: " + err.message);
    } finally {
      setCapLoading(false);
    }
  }

  // Admin authentication is handled by the layout, no need for additional checks here
  if (loading || !cursoId) return <div className="p-8">Carregando...</div>;
  if (error) return <AlertBanner type="error" message={error} />;
  if (!curso) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-blue-900">
          Personalizar Curso:{" "}
          <span className="text-blue-700">{curso.nome || curso.titulo}</span>
        </h1>
        <button
          onClick={handleDeleteCurso}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-60"
          disabled={loading}
        >
          Apagar Curso
        </button>
      </div>
      <p className="mb-6 text-gray-700 text-base">
        Adicione capítulos e vídeos ao curso. Personalize o conteúdo conforme
        sua necessidade.
      </p>
      <form
        onSubmit={handleAddCapitulo}
        className="flex flex-col gap-3 mb-8 bg-white rounded-xl shadow p-6 border border-blue-100"
      >
        <h2 className="font-bold text-lg mb-2 text-blue-800">
          Adicionar Capítulo
        </h2>
        <input
          type="text"
          placeholder="Nome do capítulo"
          value={nomeCap}
          onChange={(e) => setNomeCap(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 text-blue-900 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Título do vídeo"
          value={novoTituloVideo}
          onChange={(e) => setNovoTituloVideo(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 text-blue-900 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Link do vídeo (YouTube, Vimeo, etc)"
          value={videoCap}
          onChange={(e) => setVideoCap(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 text-blue-900 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-700 text-white rounded px-4 py-2 font-semibold hover:bg-blue-800 transition disabled:opacity-60"
          disabled={capLoading}
        >
          {capLoading ? "Salvando..." : "Adicionar Capítulo"}
        </button>
        {capError && (
          <div className="text-red-600 text-sm font-medium">{capError}</div>
        )}
        {capSuccess && (
          <div className="text-green-600 text-sm font-medium">{capSuccess}</div>
        )}
      </form>
      <form
        onSubmit={handleAddVideoToCapitulo}
        className="flex flex-col gap-3 mb-8 bg-white rounded-xl shadow p-6 border border-blue-100"
      >
        <h2 className="font-bold text-lg mb-2 text-blue-800">
          Adicionar Vídeo ao Capítulo
        </h2>
        <select
          value={capSelecionado}
          onChange={(e) => setCapSelecionado(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 text-blue-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Selecione o capítulo</option>
          {capitulos.map((cap) => (
            <option key={cap.id} value={cap.id}>
              {cap.nome}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Título do vídeo para o capítulo selecionado"
          value={novoTituloVideo}
          onChange={(e) => setNovoTituloVideo(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 text-blue-900 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Link do vídeo para o capítulo selecionado"
          value={novoVideo}
          onChange={(e) => setNovoVideo(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 text-blue-900 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-700 text-white rounded px-4 py-2 font-semibold hover:bg-blue-800 transition disabled:opacity-60"
          disabled={capLoading}
        >
          {capLoading ? "Salvando..." : "Adicionar Vídeo"}
        </button>
        {videoMsg && (
          <div
            className={
              videoMsg.includes("sucesso")
                ? "text-green-600 text-sm font-medium"
                : "text-red-600 text-sm font-medium"
            }
          >
            {videoMsg}
          </div>
        )}
      </form>
      <div className="mb-4">
        <h2 className="font-bold text-lg mb-2 text-blue-800">
          Capítulos do Curso
        </h2>
        {capLoading ? (
          <div className="text-blue-700">Carregando capítulos...</div>
        ) : capitulos.length === 0 ? (
          <div className="text-gray-400">Nenhum capítulo cadastrado.</div>
        ) : (
          <ul className="space-y-3">
            {capitulos.map((cap, idx) => (
              <li
                key={cap.id}
                className="border border-blue-100 rounded-lg p-4 bg-blue-50/60 flex flex-col gap-1"
              >
                <div className="font-semibold text-blue-900">
                  {idx + 1}. {cap.nome}
                </div>
                <div className="text-sm text-blue-700 break-all">
                  <span className="font-semibold">Vídeos:</span>
                  <ul className="ml-4 mt-1 list-disc">
                    {cap.videos && cap.videos.length > 0 ? (
                      cap.videos.map((video: Video) => (
                        <li
                          key={video.id}
                          className="mb-1 flex items-center gap-2"
                        >
                          <span className="font-bold">{video.titulo}</span>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-700 hover:text-blue-900"
                          >
                            [Assistir]
                          </a>{" "}
                          <button
                            className="text-xs text-red-600 hover:underline ml-2"
                            onClick={async () => {
                              if (confirm("Apagar este vídeo?")) {
                                await handleApagarVideo(cap.id, video.id);
                              }
                            }}
                          >
                            Apagar vídeo
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">
                        Nenhum vídeo cadastrado.
                      </li>
                    )}
                  </ul>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded bg-yellow-200 text-yellow-900 font-semibold hover:bg-yellow-300 text-xs"
                    onClick={() => {
                      setNomeCap(cap.nome || "");
                      setNovoTituloVideo(cap.videoTitulo || "");
                      setVideoCap(cap.videoUrl || "");
                      setCapSelecionado(cap.id);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-200 text-red-800 font-semibold hover:bg-red-300 text-xs"
                    onClick={() => handleApagarCapitulo(cap.id)}
                  >
                    Apagar
                  </button>
                </div>
                {/* Se o capítulo está selecionado para edição, mostra formulário inline */}
                {capSelecionado === cap.id && (
                  <form
                    className="flex flex-col gap-2 mt-2 bg-white border border-blue-100 rounded p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditarCapitulo(
                        cap.id,
                        nomeCap,
                        novoTituloVideo,
                        videoCap
                      );
                      setCapSelecionado("");
                      setNomeCap("");
                      setNovoTituloVideo("");
                      setVideoCap("");
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Nome do capítulo"
                      value={nomeCap}
                      onChange={(e) => setNomeCap(e.target.value)}
                      className="border border-blue-300 rounded px-2 py-1 text-blue-900"
                    />
                    <input
                      type="text"
                      placeholder="Título do vídeo"
                      value={novoTituloVideo}
                      onChange={(e) => setNovoTituloVideo(e.target.value)}
                      className="border border-blue-300 rounded px-2 py-1 text-blue-900"
                    />
                    <input
                      type="text"
                      placeholder="Link do vídeo"
                      value={videoCap}
                      onChange={(e) => setVideoCap(e.target.value)}
                      className="border border-blue-300 rounded px-2 py-1 text-blue-900"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        type="submit"
                        className="bg-blue-700 text-white rounded px-3 py-1 text-xs font-semibold hover:bg-blue-800"
                        disabled={capLoading}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-700 rounded px-3 py-1 text-xs font-semibold hover:bg-gray-300"
                        onClick={() => {
                          setCapSelecionado("");
                          setNomeCap("");
                          setNovoTituloVideo("");
                          setVideoCap("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
