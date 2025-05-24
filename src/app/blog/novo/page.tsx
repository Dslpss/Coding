// Editor de postagens do blog (exemplo simples)
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/app/blog/RichTextEditor"), {
  ssr: false,
});
export default function NovoPost() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Nova Postagem</h1>
      <RichTextEditor />
    </div>
  );
}
