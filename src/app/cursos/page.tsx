"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { matricularUsuarioNoCurso } from "../matricular-curso";

interface Curso {
  id: string;
  titulo?: string;
  createdAt?: Date | null;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [user] = useAuthState(auth);
  const [matriculando, setMatriculando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchCursos = async () => {
      const q = query(collection(db, "cursos"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setCursos(
        snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            titulo: data.titulo ?? `Curso #${doc.id}`,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        })
      );
    };
    fetchCursos();
  }, []);

  const handleMatricular = async (cursoId: string) => {
    if (!user) {
      setMsg("Faça login para se matricular.");
      return;
    }
    setMatriculando(cursoId);
    setMsg("");
    try {
      await matricularUsuarioNoCurso(user.uid, cursoId);
      setMsg("Matrícula realizada!");
    } catch {
      setMsg("Erro ao matricular.");
    }
    setMatriculando(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cursos Disponíveis</h1>
      <div className="grid gap-4">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="flex flex-col gap-2 bg-white/90 rounded p-4"
          >
            <span className="font-bold text-blue-900 text-lg">
              {curso.titulo || `Curso #${curso.id}`}
            </span>
            <button
              onClick={() => handleMatricular(curso.id)}
              className="bg-blue-700 hover:bg-blue-900 text-white rounded px-4 py-2 mt-2 disabled:opacity-60"
              disabled={matriculando === curso.id}
            >
              {matriculando === curso.id ? "Matriculando..." : "Matricular-se"}
            </button>
          </div>
        ))}
        {cursos.length === 0 && (
          <div className="text-gray-500">Nenhum curso disponível.</div>
        )}
      </div>
      {msg && <div className="text-green-700 mt-2">{msg}</div>}
    </div>
  );
}
