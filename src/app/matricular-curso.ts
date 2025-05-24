import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function matricularUsuarioNoCurso(
  userId: string,
  cursoId: string
) {
  await addDoc(collection(db, "matriculas"), { userId, cursoId });
}
