"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";

interface Comment {
  id: string;
  comment: string;
  createdAt?: Date | null;
}

type CommentFormFields = { comment: string };

export default function Comments({ cursoId }: { cursoId: string }) {
  const { register, handleSubmit, reset } = useForm<CommentFormFields>();
  const [comments, setComments] = useState<Comment[]>([]);
  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("cursoId", "==", cursoId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            comment: data.comment ?? "",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        })
      );
    });
    return () => unsub();
  }, [cursoId]);
  const onSubmit: SubmitHandler<CommentFormFields> = async (data) => {
    await addDoc(collection(db, "comments"), {
      cursoId,
      comment: data.comment,
      createdAt: serverTimestamp(),
    });
    reset();
  };
  return (
    <div className="mt-8 bg-gradient-to-br from-blue-900/60 via-blue-800/60 to-blue-900/80 border border-blue-700/40 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      <h2 className="font-bold mb-4 text-blue-100 text-xl flex items-center gap-2 drop-shadow">
        <svg
          className="w-5 h-5 text-blue-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2m10 0V6a4 4 0 00-8 0v2m8 0H7"
          />
        </svg>
        Comentários
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-4">
        <input
          {...register("comment", { required: true })}
          placeholder="Seu comentário"
          className="flex-1 rounded-lg px-4 py-2 bg-blue-950/60 text-blue-100 placeholder-blue-300 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-blue-900/80 transition shadow"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow transition-all"
        >
          Enviar
        </button>
      </form>
      <div className="space-y-2">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-blue-800/60 text-blue-100 rounded-lg p-3 text-sm shadow-md border border-blue-700/30"
          >
            {c.comment}
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-blue-300">Nenhum comentário ainda.</div>
        )}
      </div>
    </div>
  );
}
