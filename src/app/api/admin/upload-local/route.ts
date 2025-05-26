import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar token
    const app = initAdmin();
    const auth = getAuth(app);
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);

    // Verificar se é admin
    const db = getFirestore(app);
    
    if (!decodedClaims.email) {
      return NextResponse.json(
        { error: "Email não encontrado na sessão" },
        { status: 401 }
      );
    }
    
    const adminId = decodedClaims.email.replace(/\./g, "_").replace("@", "_");
    const adminDoc = await db.collection("admins").doc(adminId).get();

    if (!adminDoc.exists || !adminDoc.data()?.active) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 }
      );
    }

    // Obter dados do FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "courses";

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use apenas JPEG, JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 5MB." },
        { status: 400 }
      );
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    // Salvar arquivo localmente
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL pública para acesso
    const publicUrl = `/uploads/${folder}/${fileName}`;

    console.log("✅ Upload local realizado com sucesso:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });

  } catch (error) {
    console.error("❌ Erro no upload local:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
