"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { FaBook, FaArrowRight } from "react-icons/fa";

interface Curso {
  id: string;
  nome: string;
  descricao: string;
}

export default function MeusCursos() {
  const [user] = useAuthState(auth);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchMatriculas = async () => {
      setLoading(true);
      // Busca as matrículas do usuário
      const matriculasSnap = await getDocs(
        query(collection(db, "matriculas"), where("userId", "==", user.uid))
      );
      const cursoIds = matriculasSnap.docs.map((doc) => doc.data().cursoId);
      if (cursoIds.length === 0) {
        setCursos([]);
        setLoading(false);
        return;
      }
      // Busca os cursos correspondentes
      const cursosPromises = cursoIds.map(async (id: string) => {
        const cursoSnap = await getDoc(doc(db, "cursos", id));
        const data = cursoSnap.data();
        return data ? ({ id, ...data } as Curso) : null;
      });
      const cursosData = (await Promise.all(cursosPromises)).filter(
        Boolean
      ) as Curso[];
      setCursos(cursosData);
      setLoading(false);
    };
    fetchMatriculas();
  }, [user]);

  if (!user) return null;
  if (loading)
    return (
      <div className="text-white bg-blue-800/50 rounded-lg p-6 animate-pulse">
        Carregando seus cursos...
      </div>
    );
  if (cursos.length === 0)
    return (
      <div className="bg-blue-800/50 text-white rounded-lg p-6 text-center">
        <FaBook className="text-4xl mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Nenhum curso matriculado</h2>
        <p className="mb-4">Você ainda não está matriculado em nenhum curso.</p>
        <Link
          href="/cursos"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Explorar cursos <FaArrowRight className="ml-2" />
        </Link>
      </div>
    );

  return (
    <div className="bg-blue-800/10 rounded-lg p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-100">Meus Cursos</h2>
        <Link
          href="/cursos"
          className="text-blue-300 hover:text-blue-200 text-sm flex items-center"
        >
          Ver todos <FaArrowRight className="ml-1 text-xs" />
        </Link>
      </div>

      <div className="space-y-4">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200"
          >
            <div className="flex items-start">
              <div className="bg-blue-600 rounded p-2 mr-3">
                <FaBook className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{curso.nome}</h3>
                <p className="text-blue-200 text-sm line-clamp-1 mb-2">
                  {curso.descricao}
                </p>
                <Link
                  href={`/cursos/${curso.id}`}
                  className="inline-flex items-center text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                >
                  Acessar curso <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
