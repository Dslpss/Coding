// Utilitários para o painel de administração
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Verifica se um usuário é administrador
 * @param email Email do usuário
 * @returns true se for admin, false caso contrário
 */
export const checkAdminStatus = async (email: string) => {
  if (!email) return false;

  try {
    // Nas regras do Firestore, o formato do ID para admins é email.replace(/\./g, '_').replace('@', '_')
    const adminId = email.replace(/\./g, "_").replace("@", "_");

    // Verificar diretamente o documento do admin pelo ID
    const adminDocRef = doc(db, "admins", adminId);
    const adminSnapshot = await getDoc(adminDocRef);

    console.log(
      `Verificando permissões de admin para: ${email} (ID: ${adminId})`
    );
    const isAdmin = adminSnapshot.exists();
    console.log(`Status de admin: ${isAdmin ? "SIM" : "NÃO"}`);

    return isAdmin;
  } catch (err) {
    console.error("Erro ao verificar status de admin:", err);
    return false;
  }
};

/**
 * Formata um timestamp do Firestore para data legível
 * @param timestamp Timestamp do Firestore (objeto com seconds)
 * @param format Formato de data ('date', 'datetime', 'time')
 * @returns String formatada com a data
 */
export const formatTimestamp = (
  timestamp: any,
  format: "date" | "datetime" | "time" = "date"
) => {
  if (!timestamp) return "Data desconhecida";

  try {
    const date =
      timestamp instanceof Date
        ? timestamp
        : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(0);

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (format === "datetime" || format === "time") {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    if (format === "time") {
      delete options.day;
      delete options.month;
      delete options.year;
    }

    return date.toLocaleDateString("pt-BR", options);
  } catch (err) {
    console.error("Erro ao formatar timestamp:", err);
    return "Data inválida";
  }
};
