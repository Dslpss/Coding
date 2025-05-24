// Página do blog
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt?: Date | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPosts(
        snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title ?? "",
            content: data.content ?? "",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        })
      );
    };
    fetchPosts();
  }, []);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Blog de Tutoriais</h1>
      <Link href="/blog/novo" className="btn btn-primary">
        Nova Postagem
      </Link>
      <div className="mt-6 grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded shadow p-4">
            <h2 className="font-bold text-lg mb-1">{post.title}</h2>
            <div className="text-sm text-gray-700 line-clamp-3">
              {post.content}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="text-gray-500">Nenhum post ainda.</div>
        )}
      </div>
    </div>
  );
}
