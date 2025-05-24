"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { FaCalendar, FaUser, FaEye, FaSearch } from "react-icons/fa";
import BlogMenu from "./components/BlogMenu";

interface Post {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  videoUrl?: string;
  tags?: string[];
  authorName?: string;
  published?: boolean;
  createdAt?: Date | null;
  views?: number;
}

const POSTS_PER_PAGE = 6; // Número de posts por página

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalAuthors: 0,
  });

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min de leitura`;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Data não disponível";
    return new Intl.DateTimeFormat("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Filtrar posts por tag
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  // Obter todas as tags únicas
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));

  // Função para calcular estatísticas
  const calculateStats = (posts: Post[]) => {
    const authors = new Set(posts.map((post) => post.authorName));
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

    setStats({
      totalPosts: posts.length,
      totalViews: totalViews,
      totalAuthors: authors.size,
    });
  };

  // Buscar posts com filtros
  const fetchPosts = useCallback(async () => {
    try {
      console.log("Iniciando busca dos posts...");
      let postsQuery;

      // Construir a query base
      const baseQuery = collection(db, "blog");

      // Aplicar filtros de busca
      if (searchTerm) {
        postsQuery = query(
          baseQuery,
          where("title", ">=", searchTerm),
          where("title", "<=", searchTerm + "\uf8ff"),
          orderBy("title"),
          orderBy("createdAt", "desc")
        );
      } else {
        postsQuery = query(baseQuery, orderBy("createdAt", "desc"));
      }

      const snap = await getDocs(postsQuery);
      console.log(`Encontrados ${snap.size} posts no total`);

      if (snap.empty) {
        console.log("Nenhum post encontrado na coleção");
        setPosts([]);
        setLoading(false);
        return;
      }

      const allPosts = snap.docs.map((doc) => {
        const data = doc.data();
        console.log("Processando post:", { id: doc.id, title: data.title });

        return {
          id: doc.id,
          title: data.title || "Sem título",
          content: data.content || "",
          summary: data.summary || "",
          imageUrl: data.imageUrl || null,
          videoUrl: data.videoUrl || null,
          tags: data.tags || [],
          authorName: data.authorName || "Admin",
          published: true,
          views: data.views || 0,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
        };
      });

      // Aplicar filtro por tag se selecionada
      const filteredPosts = selectedTag
        ? allPosts.filter((post) => post.tags?.includes(selectedTag))
        : allPosts;

      setTotalPosts(filteredPosts.length);

      // Aplicar paginação
      const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      console.log("Posts processados:", paginatedPosts.length);
      setPosts(paginatedPosts);
      calculateStats(allPosts);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedTag, currentPage]);

  // Atualizar posts quando os filtros mudarem
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

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
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header com Estatísticas */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Blog SelfCoding
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            Dicas, tutoriais e novidades do mundo da programação
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.totalPosts}
              </div>
              <div className="text-blue-200 text-sm">Posts Publicados</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.totalViews}
              </div>
              <div className="text-blue-200 text-sm">Visualizações</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.totalAuthors}
              </div>
              <div className="text-blue-200 text-sm">Autores</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Lateral */}
          <div className="lg:w-1/4">
            <div className="sticky top-8 space-y-6">
              {/* Busca */}
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar posts..."
                      className="w-full px-4 py-2 bg-white/10 border border-blue-400/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-400"
                    >
                      <FaSearch className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              <BlogMenu />

              {/* Filtro de Tags */}
              {posts.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Tags Populares
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(posts.flatMap((post) => post.tags || []))
                    ).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(selectedTag === tag ? null : tag);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                          selectedTag === tag
                            ? "bg-blue-500 text-white"
                            : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:w-3/4 space-y-8">
            {/* Resultados da busca */}
            {searchTerm && (
              <div className="text-blue-200 mb-4">
                {totalPosts === 0
                  ? "Nenhum resultado encontrado"
                  : `${totalPosts} ${
                      totalPosts === 1
                        ? "resultado encontrado"
                        : "resultados encontrados"
                    }`}
              </div>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center text-blue-100 text-lg">
                {selectedTag
                  ? `Nenhuma postagem encontrada com a tag "${selectedTag}"`
                  : "Nenhuma postagem encontrada."}
              </div>
            ) : (
              <>
                <div className="grid gap-8 md:grid-cols-2">
                  {posts.map((post) => (
                    <Link href={`/blog/${post.id}`} key={post.id}>
                      <div className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg flex flex-col overflow-hidden border border-white/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 h-full hover:-translate-y-1">
                        {post.imageUrl && (
                          <div className="relative overflow-hidden h-48">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
                            {post.title}
                          </h2>
                          <p className="text-blue-100 text-sm mb-4 line-clamp-2 flex-1">
                            {post.summary || post.content}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {post.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm text-blue-200">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <FaUser className="w-4 h-4" />
                                {post.authorName}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaEye className="w-4 h-4" />
                                {post.views || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaCalendar className="w-4 h-4" />
                              {formatDate(post.createdAt)}
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/10 text-sm text-blue-300">
                            {estimateReadTime(post.content)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? "bg-blue-500/20 text-blue-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-500 text-white"
                              : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? "bg-blue-500/20 text-blue-300 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      Próximo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
