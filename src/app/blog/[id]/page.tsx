"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { FaCalendar, FaUser, FaEye, FaTags, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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

function formatDate(date: Date | null | undefined) {
  if (!date) return "Data não disponível";
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function BlogPost({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "blog", id);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
          setError("Post não encontrado");
          setLoading(false);
          return;
        }

        const postData = postSnap.data();
        const post: Post = {
          id: postSnap.id,
          title: postData.title || "Sem título",
          content: postData.content || "",
          summary: postData.summary || "",
          imageUrl: postData.imageUrl || null,
          videoUrl: postData.videoUrl || null,
          tags: postData.tags || [],
          authorName: postData.authorName || "Admin",
          published: true,
          views: postData.views || 0,
          createdAt: postData.createdAt?.toDate
            ? postData.createdAt.toDate()
            : new Date(),
        };

        setPost(post);

        // Incrementa o contador de visualizações
        await updateDoc(postRef, {
          views: increment(1),
        });
      } catch (error) {
        console.error("Erro ao buscar post:", error);
        setError("Erro ao carregar o post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Erro</h1>
          <p className="text-blue-100 mb-6">{error || "Post não encontrado"}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaArrowLeft />
            Voltar para o blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Voltar para o blog */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8"
      >
        <FaArrowLeft />
        Voltar para o blog
      </Link>

      {/* Cabeçalho do Post */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-blue-200 text-sm mb-6">
          <div className="flex items-center gap-2">
            <FaUser className="w-4 h-4" />
            {post.authorName}
          </div>
          <div className="flex items-center gap-2">
            <FaCalendar className="w-4 h-4" />
            {formatDate(post.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <FaEye className="w-4 h-4" />
            {post.views} visualizações
          </div>
        </div>

        {post.imageUrl && (
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <FaTags className="text-blue-400" />
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-400/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo do Post */}
      <div className="prose prose-invert prose-blue max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </article>
  );
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
      <BlogPost id={params.id} />
    </div>
  );
}
