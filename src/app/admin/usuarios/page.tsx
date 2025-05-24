"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  limit,
  orderBy,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { FaUser, FaSearch } from "react-icons/fa";
import Image from "next/image";
import AlertBanner from "../components/AlertBanner";
import { checkAdminStatus } from "../utils/adminUtils";

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
  isAdmin?: boolean;
  matriculas?: number;
  status?: "active" | "inactive" | "banned";
}

export default function AdminUsuarios() {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Buscar usuários
  const fetchUsers = useCallback(
    async (startAfterDoc?: QueryDocumentSnapshot<DocumentData>) => {
      if (!isAdmin) return;

      console.log("Iniciando busca de usuários como admin...");
      setLoading(true);

      try {
        let usersQuery;
        if (startAfterDoc) {
          usersQuery = query(
            collection(db, "users"),
            orderBy("email"),
            startAfter(startAfterDoc),
            limit(10)
          );
        } else {
          usersQuery = query(
            collection(db, "users"),
            orderBy("email"),
            limit(10)
          );
        }

        const usersSnapshot = await getDocs(usersQuery);
        console.log("Usuários encontrados:", usersSnapshot.size);
        console.log(
          "Docs retornados:",
          usersSnapshot.docs.map((d) => d.id)
        );
        if (usersSnapshot.empty) {
          setHasMore(false);
          if (!startAfterDoc) {
            setUsers([]);
          }
          // Log extra para depuração
          console.warn(
            "Nenhum usuário encontrado. Verifique as regras do Firestore e se há documentos na coleção 'users'."
          );
          return;
        }

        setLastVisible(usersSnapshot.docs[usersSnapshot.docs.length - 1]);

        const usersList = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || "Usuário sem nome",
            email: data.email || "Sem e-mail",
            photoURL: data.photoURL,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
            status: data.status || "active",
            matriculas: data.matriculas || 0,
          };
        });

        if (startAfterDoc) {
          setUsers((prev) => [...prev, ...usersList]);
        } else {
          setUsers(usersList);
        }

        setError(null);
        console.log(
          "Lista de usuários atualizada:",
          usersList.length,
          "usuários",
          usersList
        );
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Erro ao buscar usuários:", error);
        setError(
          "Erro ao carregar usuários: " +
            error.message +
            (error.message?.includes("permission-denied")
              ? " (Verifique as regras do Firestore e permissões do usuário autenticado)"
              : "")
        );
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // Verificar status de admin quando o usuário mudar
  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      if (!user?.email) {
        if (mounted) {
          setLoading(false);
          setError("Usuário não autenticado");
        }
        return;
      }

      try {
        console.log("Verificando status de admin para:", user.email);
        const adminStatus = await checkAdminStatus(user.email);
        console.log("Status de admin recebido:", adminStatus);

        if (mounted) {
          setIsAdmin(adminStatus);
          if (!adminStatus) {
            setLoading(false);
            setError("Você não tem permissões de administrador");
          }
        }
      } catch (err) {
        console.error("Erro ao verificar status de admin:", err);
        if (mounted) {
          setError("Erro ao verificar permissões");
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Buscar usuários quando o status de admin mudar
  useEffect(() => {
    console.log("Status de admin mudou:", isAdmin);
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  // Atualizar status do usuário
  const updateUserStatus = async (
    userId: string,
    status: "active" | "inactive" | "banned"
  ) => {
    if (!isAdmin) return;

    try {
      await updateDoc(doc(db, "users", userId), {
        status: status,
        updatedAt: new Date(),
      });

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: status } : u))
      );

      setError(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Erro ao atualizar status:", error);
      setError("Erro ao atualizar status: " + error.message);
    }
  };

  // Excluir usuário
  const handleDelete = async (userId: string, userName: string) => {
    if (!isAdmin) return;

    if (!confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", userId));
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
