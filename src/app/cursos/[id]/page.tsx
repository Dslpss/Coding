"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import Comments from "@/app/cursos/Comments";
import { FaPlay, FaBook, FaChevronDown } from "react-icons/fa";
import VideoPlayer from "@/app/cursos/VideoPlayer";

interface Curso {
  id: string;
  nome?: string;
  titulo?: string;
  descricao?: string;
}
interface Video {
  id: string;
  titulo: string;
  url: string;
}
interface Capitulo {
  id: string;
  nome: string;
  videos: Video[];
}

export default function CursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoAtual, setVideoAtual] = useState<Video | null>(null);
  const [capituloAberto, setCapituloAberto] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Buscar dados do curso
        const ref = doc(db, "cursos", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCurso({ id: snap.id, ...snap.data() } as Curso);
        } else {
          setError("Curso não encontrado.");
        } // Buscar capítulos e vídeos
        const q = query(
          collection(db, "cursos", id, "chapters"),
          orderBy("createdAt", "asc")
        );
        const snapCap = await getDocs(q);
        const capitulosComVideos = await Promise.all(
          snapCap.docs.map(async (docCap) => {
            const data = docCap.data();
            const videosSnap = await getDocs(
              collection(db, "cursos", id, "chapters", docCap.id, "videos")
            );
            let videos: Video[] = videosSnap.docs.map(
              (v) =>
                ({
                  id: v.id,
                  ...v.data(),
                } as Video)
            );
            // Compatibilidade retroativa: inclui vídeo antigo se existir
            if (data.videoUrl && data.videoTitulo) {
              videos = [
                {
                  id: "legacy",
                  titulo: data.videoTitulo,
                  url: data.videoUrl,
                },
                ...videos,
              ];
            }
            return { id: docCap.id, nome: data.nome, videos };
          })
        );
        setCapitulos(capitulosComVideos);
      } catch (e) {
        setError("Erro ao carregar dados do curso.");
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <div className="font-semibold">Erro</div>
        <div>{error}</div>
      </div>
    );
  if (!curso) return null;

  const handleVideoClick = (video: Video) => {
    setVideoAtual(video);
  };

  const toggleCapitulo = (capId: string) => {
    setCapituloAberto(capituloAberto === capId ? null : capId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Cabeçalho do curso */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-3">
            {curso.nome || curso.titulo}
          </h1>
          {curso.descricao && (
            <p className="text-blue-100 text-lg leading-relaxed">
              {curso.descricao}
            </p>
          )}
        </div>
        {/* Área do Vídeo e Conteúdo */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player de Vídeo */}
          <div className="lg:col-span-2">
            {videoAtual ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden mb-6 shadow-lg">
                <VideoPlayer url={videoAtual.url} />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">
                    {videoAtual.titulo}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center h-[400px] flex items-center justify-center shadow-lg">
                <div>
                  <FaPlay className="w-16 h-16 mx-auto text-blue-300 mb-4" />
                  <p className="text-blue-100">
                    Selecione um vídeo ao lado para começar a assistir
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Capítulos */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
              <h2 className="font-bold text-xl mb-6 px-2 flex items-center gap-2 text-white">
                <FaBook className="text-blue-300" />
                Conteúdo do Curso
              </h2>

              {capitulos.length > 0 ? (
                <div className="space-y-2">
                  {capitulos.map((cap, idx) => (
                    <div
                      key={cap.id}
                      className="border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleCapitulo(cap.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <span className="font-medium text-gray-700">
                          {idx + 1}. {cap.nome}
                        </span>
                        <FaChevronDown
                          className={`text-gray-400 transition-transform ${
                            capituloAberto === cap.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden transition-all ${
                          capituloAberto === cap.id ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <ul className="bg-white p-3 space-y-2">
                          {cap.videos && cap.videos.length > 0 ? (
                            cap.videos.map((video) => (
                              <li
                                key={video.id}
                                onClick={() => handleVideoClick(video)}
                                className="flex items-center gap-2 p-2 rounded hover:bg-blue-50 cursor-pointer group"
                              >
                                <FaPlay
                                  className="text-blue-400 group-hover:text-blue-500"
                                  size={12}
                                />
                                <span className="text-gray-700 group-hover:text-blue-600">
                                  {video.titulo}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-400 p-2">
                              Nenhum vídeo cadastrado
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FaBook className="mx-auto mb-2 text-gray-300" size={24} />
                  Nenhum conteúdo cadastrado ainda
                </div>
              )}
            </div>
          </div>
        </div>{" "}
        {/* Área de Comentários */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6">
          <Comments cursoId={params.id} />
        </div>
      </div>
    </div>
  );
}
