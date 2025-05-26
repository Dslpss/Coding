import { NextRequest, NextResponse } from "next/server";
import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Inicializar Firebase Admin
initAdmin();

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Verificar token com Firebase Admin
    const auth = getAuth();
    const db = getFirestore();
    try {
      const decodedToken = await auth.verifySessionCookie(adminSession.value);

      // Verificar se admin ainda existe e está ativo
      const adminId = decodedToken.email?.replace(/\./g, "_").replace("@", "_");
      if (!adminId) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }

      const adminDoc = await db.collection("admins").doc(adminId).get();
      if (!adminDoc.exists) {
        return NextResponse.json(
          { error: "Admin não encontrado" },
          { status: 403 }
        );
      }

      const adminData = adminDoc.data();
      if (!adminData?.active) {
        return NextResponse.json(
          { error: "Conta administrativa desativada" },
          { status: 403 }
        );
      } // Atualizar último acesso
      await adminDoc.ref.update({
        lastAccess: new Date(),
        lastAccessIp:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
      });
      return NextResponse.json({
        valid: true,
        email: decodedToken.email,
        role: adminData.role,
        permissions: adminData.permissions || [],
      });
    } catch (error: any) {
      console.error("Erro na verificação do token:", error);

      // Se o token estiver expirado, retornar código específico
      if (error?.code === "auth/session-cookie-expired") {
        return NextResponse.json({ error: "Sessão expirada" }, { status: 440 }); // 440 = Login Time-out
      }

      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
