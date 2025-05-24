// src/app/admin/blog/novo/page.tsx
"use client";
import RichTextEditor from "@/app/blog/RichTextEditor";

export default function AdminNovoPost() {
  return (
    <div className="max-w-2xl mx-auto bg-white/90 rounded-xl shadow-2xl p-8 mt-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">
        Nova Postagem no Blog
      </h1>
      <RichTextEditor />
    </div>
  );
}
