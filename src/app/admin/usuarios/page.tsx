"use client";

import { useState, useEffect, useCallback } from "react";
import { FaUser, FaSearch } from "react-icons/fa";
import Image from "next/image";
import AlertBanner from "../components/AlertBanner";

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: Date | null;
  lastLogin?: Date | null;
  isAdmin?: boolean;
  matriculas?: number;
  status?: "active" | "inactive" | "banned";
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // Buscar usuários
  const fetchUsers = useCallback(async (startAfter?: string) => {
    console.log("Iniciando busca de usuários via API...");
    setLoading(true);

    try {
      // Construir URL da API com parâmetros
      const params = new URLSearchParams({
        limit: "10",
      });

      if (startAfter) {
        params.append("startAfter", startAfter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: "include", // Incluir cookies de sessão
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
      console.log("Usuários encontrados:", data.users.length);

      if (!data.users || data.users.length === 0) {
        setHasMore(false);
        if (!startAfter) {
          setUsers([]);
        }
        console.warn("Nenhum usuário encontrado.");
        return;
      }

      setLastVisible(data.lastVisible);
      setHasMore(data.hasMore);

      // Converter datas de string para Timestamp para compatibilidade
      const usersList = data.users.map((user: any) => ({
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt) : null,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      }));

      if (startAfter) {
        setUsers((prev) => [...prev, ...usersList]);
      } else {
        setUsers(usersList);
      }

      setError(null);
      console.log(
        "Lista de usuários atualizada:",
        usersList.length,
        "usuários"
      );
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro ao buscar usuários:", error);
      setError(error.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, []);
  // Buscar usuários na inicialização
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Atualizar status do usuário
  const updateUserStatus = async (
    userId: string,
    status: "active" | "inactive" | "banned"
  ) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          updates: { status, updatedAt: new Date() },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar status");
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: status } : u))
      );

      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro ao atualizar status:", error);
      setError("Erro ao atualizar status: " + error.message);
    }
  }; // Excluir usuário
  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir usuário");
      }

      setUsers(users.filter((u) => u.id !== userId));
      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro ao excluir usuário:", error);
      setError("Erro ao excluir usuário: " + error.message);
    }
  };

  // Carregar mais usuários
  const loadMoreUsers = () => {
    if (lastVisible) {
      fetchUsers(lastVisible);
    }
  };

  // Filtrar usuários baseado na busca
  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <AlertBanner message={error} type="error" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Usuários</h1>

      {/* Busca */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar usuários..."
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Usuários */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Usuário
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
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
                    Matrículas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt={user.displayName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <FaUser className="h-10 w-10 text-gray-400" />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            updateUserStatus(
                              user.id,
                              e.target.value as "active" | "inactive" | "banned"
                            )
                          }
                          className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                          <option value="banned">Banido</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.matriculas || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleDelete(user.id, user.displayName)
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={loadMoreUsers}
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Carregando..." : "Carregar Mais"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
