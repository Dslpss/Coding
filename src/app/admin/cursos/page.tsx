"use client";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaBook, FaSpinner, FaUsers } from "react-icons/fa";
import Image from "next/image";
import AlertBanner from "../components/AlertBanner";
import ImageUpload from "../components/ImageUpload";
import { formatTimestamp } from "../utils/adminUtils";

interface Curso {
  id: string;
  nome: string;
  titulo?: string;
  descricao: string;
  nivel?: string;
  preco?: number;
  imagemUrl?: string;
  createdAt?: Date | null;
  totalMatriculas?: number;
}

export default function AdminCursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nivel, setNivel] = useState("");
  const [preco, setPreco] = useState("");
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Função para buscar cursos via API
  async function fetchCursos() {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Buscando cursos via API...");

      const response = await fetch("/api/admin/courses", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        } else if (response.status === 403) {
          throw new Error("Acesso negado. Permissões insuficientes.");
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      console.log("✅ Cursos encontrados:", data.courses.length); // Converter datas de string para objetos Date se necessário
      const cursosComDatas = data.courses.map((curso: Curso) => ({
        ...curso,
        createdAt: curso.createdAt ? new Date(curso.createdAt) : null,
      }));

      setCursos(cursosComDatas);
      setError("");
    } catch (err: unknown) {
      console.error("❌ Erro ao buscar cursos:", err);
      setError(
        "Erro ao buscar cursos: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCursos();
  }, []);

  // Função para adicionar curso via API
  async function handleAddCurso(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !descricao.trim()) {
      setError("Nome e descrição são obrigatórios");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
          nivel: nivel || "Iniciante",
          preco: preco ? parseFloat(preco) : 0,
          imagemUrl: imagemUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar curso");
      }

      const data = await response.json();

      // Adicionar o novo curso à lista
      setCursos((prev) => [data.course, ...prev]); // Limpar formulário
      setNome("");
      setDescricao("");
      setNivel("");
      setPreco("");
      setImagemUrl(null);

      setSuccess("Curso adicionado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      console.error("Erro ao adicionar curso:", err);
      setError(
        "Erro ao adicionar curso: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  }

  // Função para excluir curso via API
  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir o curso "${nome}"?`)) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/courses?courseId=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir curso");
      }

      // Remover curso da lista
      setCursos((prev) => prev.filter((curso) => curso.id !== id));
      setSuccess("Curso excluído com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      console.error("Erro ao excluir curso:", err);
      setError(
        "Erro ao excluir curso: " +
          (err instanceof Error ? err.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full">
      {" "}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerenciar Cursos</h1>
      </div>
      {error && (
        <AlertBanner
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <AlertBanner
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Course Form */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
            <FaPlus className="mr-2 text-blue-600" />
            Adicionar Novo Curso
          </h2>
          <form onSubmit={handleAddCurso} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do curso *
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: JavaScript Avançado"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição *
              </label>
              <textarea
                id="descricao"
                placeholder="Uma breve descrição do curso..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
            <div>
              <label
                htmlFor="nivel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nível
              </label>
              <select
                id="nivel"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o nível</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>{" "}
            <div>
              <label
                htmlFor="preco"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Preço (R$)
              </label>
              <input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para curso gratuito
              </p>
            </div>
            <ImageUpload
              onImageChange={setImagemUrl}
              currentImage={imagemUrl}
              folder="courses"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaPlus className="mr-2" />
              )}{" "}
              {loading ? "Salvando..." : "Adicionar Curso"}
            </button>
          </form>
        </div>
        {/* Courses List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center">
              <FaBook className="mr-2 text-gray-600" />
              Cursos cadastrados ({cursos.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="px-6 pb-6">
              {cursos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <FaBook className="mx-auto h-12 w-12 text-gray-400" />{" "}
                  <h3 className="mt-2 text-sm font-medium text-gray-600">
                    Nenhum curso cadastrado
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece adicionando seu primeiro curso.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {" "}
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Curso
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nível/Preço
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Matrículas
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {cursos.map((curso) => (
                        <tr
                          key={curso.id}
                          className="hover:bg-blue-50/60 transition cursor-pointer focus:bg-blue-100/80"
                          onClick={() =>
                            (window.location.href = `/admin/cursos/${curso.id}`)
                          }
                          tabIndex={0}
                          style={{ outline: "none" }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              window.location.href = `/admin/cursos/${curso.id}`;
                          }}
                        >
                          {" "}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              {" "}
                              {curso.imagemUrl && (
                                <div className="flex-shrink-0">
                                  <div className="w-16 h-16 relative rounded-lg overflow-hidden border border-gray-200">
                                    <Image
                                      src={curso.imagemUrl}
                                      alt={curso.nome}
                                      fill
                                      className="object-cover"
                                      unoptimized={true}
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-blue-700 hover:underline truncate">
                                  {curso.nome}
                                </div>
                                <div className="text-sm text-blue-400 max-w-xs truncate">
                                  {curso.descricao}
                                </div>
                                {curso.createdAt && (
                                  <div className="text-xs text-blue-200">
                                    Criado em {formatTimestamp(curso.createdAt)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-blue-900">
                              {curso.nivel && (
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    curso.nivel === "Iniciante"
                                      ? "bg-green-50 text-green-800"
                                      : curso.nivel === "Intermediário"
                                      ? "bg-yellow-50 text-yellow-800"
                                      : "bg-red-50 text-red-800"
                                  }`}
                                >
                                  {curso.nivel}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-blue-400">
                              {curso.preco
                                ? new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(curso.preco)
                                : "Gratuito"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-blue-900">
                              <FaUsers className="mr-1 text-blue-300" />
                              {curso.totalMatriculas || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              {" "}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(curso.id, curso.nome);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                disabled={loading}
                              >
                                <FaTrash className="mr-1" size={12} />
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
