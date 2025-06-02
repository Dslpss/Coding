"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
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

interface Video {
  id: string;
  titulo: string;
  url: string;
  createdAt?: unknown;
}

interface PageParams {
  params: {
    id: string;
  };
}

export default function CursoPersonalizarPage({ params }: PageParams) {
  const router = useRouter();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ... resto do código permanece igual

  return (
    <div className="container mx-auto px-4 py-8">
      {error && <AlertBanner message={error} type="error" />}
      {success && <AlertBanner message={success} type="success" />}
      
      {/* ... resto do JSX permanece igual */}
    </div>
  );
}
