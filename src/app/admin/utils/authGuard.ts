import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function checkAdminStatus(email: string) {
  try {
    const adminId = email.replace(/\./g, "_").replace("@", "_");
    const adminRef = doc(db, "admins", adminId);
    const adminSnap = await getDoc(adminRef);
    return adminSnap.exists();
  } catch (error) {
    console.error("Erro ao verificar status de admin:", error);
    return false;
  }
}
