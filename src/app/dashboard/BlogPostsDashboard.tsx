"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BlogPostsDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-white">Carregando posts...</div>;
  }

  if (!posts.length) {
    return <div className="text-blue-100">Nenhum post encontrado.</div>;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">
        Últimas Postagens do Blog
      </h2>
      <div className="grid gap-4">
        {posts.slice(0, 5).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug || post.id}`}
            className="block bg-blue-800/30 hover:bg-blue-800/50 rounded-lg p-4 transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {post.title}
                </h3>
                <p className="text-blue-100 text-sm line-clamp-2">
                  {post.summary}
                </p>
              </div>
              <span className="text-xs text-blue-200 mt-2 md:mt-0 md:ml-4">
                {post.createdAt?.toDate
                  ? post.createdAt.toDate().toLocaleDateString()
                  : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
