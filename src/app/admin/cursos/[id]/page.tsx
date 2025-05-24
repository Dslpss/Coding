"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/lib/firebase";
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
  const [user] = useAuthState(auth);
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
    if (!user || !cursoId) return;
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
  }, [user, cursoId]);

  // Buscar capítulos
  useEffect(() => {
    if (!cursoId) return;
    const fetchCapitulos = async () => {
      setCapLoading(true);
      try {
        const q = query(
          collection(db, "cursos", cursoId, "chapters"),
          orderBy("createdAt", "asc")
        );
        const snap = await getDocs(q);
        // Para cada capítulo, buscar vídeos
        const capitulosComVideos = await Promise.all(
          snap.docs.map(async (docCap) => {
            const data = docCap.data();
            const videosSnap = await getDocs(
              collection(db, "cursos", cursoId, "chapters", docCap.id, "videos")
            );

            // Criar array de vídeos combinando subcoleção e vídeo do capítulo
            const videosSubcolecao = videosSnap.docs.map(
              (v) =>
                ({
                  id: v.id,
                  ...v.data(),
                } as Video)
            );

            const videos: Video[] =
              data.videoUrl && data.videoTitulo
                ? [
                    {
                      id: "legacy",
                      titulo: data.videoTitulo,
                      url: data.videoUrl,
                    },
                    ...videosSubcolecao,
                  ]
                : videosSubcolecao;

            return {
              id: docCap.id,
              nome: data.nome,
              videoUrl: data.videoUrl,
              videoTitulo: data.videoTitulo,
              createdAt: data.createdAt,
              videos,
            };
          })
        );
        setCapitulos(capitulosComVideos);
      } catch {
        setCapError("Erro ao buscar capítulos.");
      }
      setCapLoading(false);
    };
    fetchCapitulos();
  }, [cursoId, capSuccess]);

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
      await addDoc(collection(db, "cursos", cursoId!, "chapters"), {
        nome: nomeCap.trim(),
        videoUrl: videoCap.trim(),
        videoTitulo: novoTituloVideo.trim(),
        createdAt: serverTimestamp(),
      });
      setNomeCap("");
      setVideoCap("");
      setNovoTituloVideo("");
      setCapSuccess("Capítulo adicionado!");
    } catch {
      setCapError("Erro ao adicionar capítulo.");
    }
    setCapLoading(false);
  }

  // Adicionar vídeo em subcoleção 'videos' de cada capítulo
  async function handleAddVideoToCapitulo(e: React.FormEvent) {
    e.preventDefault();
    setVideoMsg("");
    if (!capSelecionado || !novoVideo.trim() || !novoTituloVideo.trim()) {
      setVideoMsg("Selecione um capítulo, insira o título e o link do vídeo.");
      return;
    }
    setCapLoading(true);
    try {
      await addDoc(
        collection(
          db,
          "cursos",
          cursoId!,
          "chapters",
          capSelecionado,
          "videos"
        ),
        {
          titulo: novoTituloVideo.trim(),
          url: novoVideo.trim(),
          createdAt: serverTimestamp(),
        }
      );
      setNovoVideo("");
      setNovoTituloVideo("");
      setCapSelecionado("");
      setVideoMsg("Vídeo adicionado ao capítulo!");
      setCapSuccess(""); // força refresh dos capítulos
    } catch {
      setVideoMsg("Erro ao adicionar vídeo ao capítulo.");
    }
    setCapLoading(false);
  }

  // Função para apagar o curso
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
      await deleteDoc(doc(db, "cursos", cursoId));
      setLoading(false);
      alert("Curso apagado com sucesso!");
      router.push("/admin/cursos");
    } catch {
      setError("Erro ao apagar curso.");
      setLoading(false);
    }
  }

  // Função para editar capítulo (nome, título do vídeo, link)
  async function handleEditarCapitulo(
    capId: string,
    novoNome: string,
    novoTitulo: string,
    novoLink: string
  ) {
    setCapLoading(true);
    setCapError("");
    try {
      // Atualiza o nome do capítulo
      const capRef = doc(db, "cursos", cursoId!, "chapters", capId);
      await updateDoc(capRef, {
        nome: novoNome,
      });

      // Adiciona o vídeo na subcoleção videos
      if (novoTitulo && novoLink) {
        await addDoc(
          collection(db, "cursos", cursoId!, "chapters", capId, "videos"),
          {
            titulo: novoTitulo.trim(),
            url: novoLink.trim(),
            createdAt: serverTimestamp(),
          }
        );
      }

      setCapSuccess("Capítulo atualizado!");
    } catch {
      setCapError("Erro ao editar capítulo.");
    }
    setCapLoading(false);
  }

  // Função para apagar capítulo
  async function handleApagarCapitulo(capId: string) {
    if (!confirm("Tem certeza que deseja apagar este capítulo?")) return;
    setCapLoading(true);
    setCapError("");
    try {
      await deleteDoc(doc(db, "cursos", cursoId!, "chapters", capId));
      setCapSuccess("Capítulo apagado!");
    } catch {
      setCapError("Erro ao apagar capítulo.");
    }
    setCapLoading(false);
  }

  if (!user)
    return <AlertBanner type="warning" message="Faça login para acessar." />;
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
                          </a>
                          <button
                            className="text-xs text-red-600 hover:underline ml-2"
                            onClick={async () => {
                              if (confirm("Apagar este vídeo?")) {
                                await deleteDoc(
                                  doc(
                                    db,
                                    "cursos",
                                    cursoId!,
                                    "chapters",
                                    cap.id,
                                    "videos",
                                    video.id
                                  )
                                );
                                setCapSuccess("Vídeo apagado!");
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
