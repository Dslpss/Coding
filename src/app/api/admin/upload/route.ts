import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { initAdmin } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

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
    }    // Verificar token
    const app = initAdmin();
    const auth = getAuth(app);
    const decodedClaims = await auth.verifySessionCookie(sessionCookie.value, true);    // Verificar se é admin
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
    const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;    // Upload para Firebase Storage
    const storage = getStorage(app);
    
    try {
      // Tentar usar o bucket específico primeiro
      let bucket;
      let publicUrl;
      
      try {
        bucket = storage.bucket("barbearia-bd25e.appspot.com");
        const [exists] = await bucket.exists();
        
        if (!exists) {
          console.log("❌ Bucket específico não existe. Tentando bucket padrão...");
          bucket = storage.bucket(); // Usar bucket padrão
        }
      } catch (bucketError) {
        console.log("❌ Erro ao acessar bucket específico. Usando bucket padrão...");
        bucket = storage.bucket(); // Usar bucket padrão
      }
      
      const fileRef = bucket.file(fileName);

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      // Tornar o arquivo público
      await fileRef.makePublic();

      // Obter URL pública
      publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      console.log("✅ Upload realizado com sucesso:", publicUrl);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
      });
      
    } catch (storageError) {
      console.error("❌ Erro específico do Storage:", storageError);
      
      // Se falhar, tentar uma abordagem alternativa usando apenas o nome do projeto
      console.log("🔄 Tentando abordagem alternativa...");
      
      try {
        // Usar apenas o nome do projeto como bucket
        const projectBucket = storage.bucket();
        const fileRef = projectBucket.file(fileName);

        await fileRef.save(buffer, {
          metadata: {
            contentType: file.type,
          },
        });

        // Tornar o arquivo público
        await fileRef.makePublic();

        // URL alternativa
        const alternativeUrl = `https://firebasestorage.googleapis.com/v0/b/${projectBucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
        
        console.log("✅ Upload realizado com abordagem alternativa:", alternativeUrl);

        return NextResponse.json({
          success: true,
          url: alternativeUrl,
          fileName: fileName,
        });
        
      } catch (alternativeError) {
        console.error("❌ Erro na abordagem alternativa:", alternativeError);
        throw new Error(`Erro no Firebase Storage: ${storageError instanceof Error ? storageError.message : 'Erro desconhecido'}`);
      }
    }

  } catch (error) {
    console.error("❌ Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
