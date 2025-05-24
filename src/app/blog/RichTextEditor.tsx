import { useForm, SubmitHandler } from "react-hook-form";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type PostFormFields = { title: string; content: string };

export default function RichTextEditor() {
  const { register, handleSubmit, reset } = useForm<PostFormFields>();
  const onSubmit: SubmitHandler<PostFormFields> = async (data) => {
    try {
      await addDoc(collection(db, "posts"), {
        title: data.title,
        content: data.content,
        createdAt: serverTimestamp(),
      });
      alert("Post publicado!");
      reset();
    } catch (e) {
      if (e instanceof Error) alert("Erro ao publicar: " + e.message);
      else alert("Erro desconhecido");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <input
        {...register("title", { required: true })}
        placeholder="Título"
        className="input input-bordered"
      />
      <textarea
        {...register("content", { required: true })}
        placeholder="Conteúdo"
        rows={8}
        className="textarea textarea-bordered"
      />
      <button type="submit" className="btn btn-primary">
        Publicar
      </button>
    </form>
  );
}
