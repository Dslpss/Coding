const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

async function initAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccountPath = path.join(
      process.cwd(),
      "service-account.json.json"
    );

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccountFile = fs.readFileSync(serviceAccountPath, "utf8");
      const serviceAccount = JSON.parse(serviceAccountFile);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else {
      throw new Error("Arquivo de credenciais não encontrado");
    }
  }
}

async function checkPost() {
  try {
    console.log("🔍 Verificando post do blog...\n");

    await initAdmin();
    const db = admin.firestore();

    // ID do post que está dando erro
    const postId = "yhSgRwDhL5OWkPrXkjiJ";

    console.log(`🎯 Buscando post: ${postId}`);
    const postDoc = await db.collection("blog").doc(postId).get();

    if (postDoc.exists) {
      const postData = postDoc.data();
      console.log("✅ Post encontrado!");
      console.log(`   Título: ${postData.title || "N/A"}`);
      console.log(`   Publicado: ${postData.published || false}`);
      console.log(`   Autor: ${postData.authorName || "N/A"}`);
      console.log(`   Criado em: ${postData.createdAt?.toDate() || "N/A"}`);
      console.log(`   Conteúdo: ${postData.content ? "Presente" : "Ausente"}`);
      console.log(`   Views: ${postData.views || 0}`);
      console.log(`   Tags: ${JSON.stringify(postData.tags || [])}`);
    } else {
      console.log("❌ Post não encontrado!");

      // Listar alguns posts da coleção blog
      console.log("\n📋 Listando posts existentes:");
      const blogSnapshot = await db.collection("blog").limit(5).get();

      if (blogSnapshot.empty) {
        console.log("❌ Nenhum post encontrado na coleção blog");
      } else {
        blogSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`   📄 ${doc.id} - ${data.title || "Sem título"}`);
        });
      }
    }
  } catch (error) {
    console.error("❌ Erro ao verificar post:", error);
  }
}

checkPost();
