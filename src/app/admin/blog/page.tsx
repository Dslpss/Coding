"use client";
import { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { formatTimestamp } from "../utils/adminUtils";
import AlertBanner from "../components/AlertBanner";

interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  authorId?: string;
  authorName?: string;
  summary?: string;
  content?: string;
  tags?: string[];
  published?: boolean;
  createdAt: Date | null;
  updatedAt?: Date | null;
}

const POSTS_PER_PAGE = 10;

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Estados para mensagens
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const showMessage = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    try {
      console.log("Iniciando busca de posts...");

      // Query mais simples para evitar problemas
      const postsQuery = query(
        collection(db, "blog"),
        orderBy("createdAt", "desc")
      );

      const postsSnapshot = await getDocs(postsQuery);
      console.log(`Encontrados ${postsSnapshot.size} posts`);

      const postsList = postsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Título não definido",
          slug: data.slug,
          authorId: data.authorId,
          authorName: data.authorName,
          summary: data.summary,
          content: data.content,
          tags: data.tags || [],
          published: data.published || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as BlogPost;
      });

      setTotalPosts(postsList.length); // Aplicar paginação
      const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedPosts = postsList.slice(startIndex, endIndex);

      setPosts(paginatedPosts);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);

      showMessage(
        "Não foi possível carregar os posts: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleDelete(id: string, title: string) {
    if (
      !confirm(
        `Tem certeza que deseja excluir o post "${title}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "blog", id));
      showMessage("Post excluído com sucesso!", "success");
      // Recarregar a lista
      fetchPosts();
    } catch (error) {
      console.error("Erro ao excluir post:", error);
      showMessage(
        "Erro ao excluir post: " +
          (error instanceof Error ? error.message : "Erro desconhecido"),
        "error"
      );
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="w-full">
      {/* Alert Banner */}
      {showAlert && (
        <AlertBanner
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Gerenciar Blog</h1>
        <Link
          href="/admin/blog/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2 justify-center sm:justify-start"
        >
          <FaPlus size={14} /> Novo Post
        </Link>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar posts por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaSearch size={14} />
            Buscar
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            >
              Limpar
            </button>
          )}
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaEdit className="text-blue-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total de Posts
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <FaPlus className="text-green-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Página Atual</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentPage} de {totalPages || 1}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaSearch className="text-purple-600" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Filtro Ativo</p>
              <p className="text-2xl font-bold text-gray-900">
                {searchTerm ? "Sim" : "Não"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Posts */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v10m2 4h-6a2 2 0 01-2-2v-6"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-600">
              {searchTerm ? "Nenhum post encontrado" : "Nenhum post encontrado"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Tente ajustar os termos da busca."
                : "Comece criando seu primeiro post para o blog."}
            </p>
            <div className="mt-6">
              <Link
                href="/admin/blog/novo"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Criar novo post
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Título
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Autor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                          {post.summary && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {post.summary.length > 100
                                ? post.summary.substring(0, 100) + "..."
                                : post.summary}
                            </div>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.published ? "Publicado" : "Rascunho"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatTimestamp(post.createdAt)}
                        </div>
                        {post.updatedAt && (
                          <div className="text-xs text-gray-400">
                            Atualizado: {formatTimestamp(post.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {post.authorName || "Autor desconhecido"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/blog/${post.id}/editar`}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar post"
                          >
                            <FaEdit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Excluir post"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * POSTS_PER_PAGE + 1}
                      </span>{" "}
                      até{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * POSTS_PER_PAGE, totalPosts)}
                      </span>{" "}
                      de <span className="font-medium">{totalPosts}</span>{" "}
                      resultados
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Anterior</span>
                        <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Próximo</span>
                        <FaChevronRight
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
