import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import * as path from "path";
import * as fs from "fs";

// Variável para controlar se já foi inicializado
let firebaseAdmin: App | null = null;

export const initAdmin = () => {
  if (!firebaseAdmin) {
    // Verificar se já existe uma instância
    if (!getApps().length) {
      try {
        // Carregar credenciais do arquivo service account
        const serviceAccountPath = path.join(
          process.cwd(),
          "service-account.json.json"
        );

        let serviceAccount;

        // Tentar carregar do arquivo primeiro, depois das variáveis de ambiente
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccountFile = fs.readFileSync(
            serviceAccountPath,
            "utf8"
          );
          serviceAccount = JSON.parse(serviceAccountFile);
          console.log(
            "📁 Carregando credenciais do arquivo service-account.json.json"
          );
        } else if (process.env.FIREBASE_PRIVATE_KEY) {
          // Fallback para variáveis de ambiente
          serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID || "barbearia-bd25e",
            clientEmail:
              process.env.FIREBASE_CLIENT_EMAIL ||
              "firebase-adminsdk-x1bd1@barbearia-bd25e.iam.gserviceaccount.com",
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          };
          console.log("🌍 Carregando credenciais das variáveis de ambiente");
        } else {
          throw new Error(
            "❌ Credenciais do Firebase não encontradas. Configure o arquivo service-account.json.json ou as variáveis de ambiente."
          );
        }

        // Validar campos obrigatórios
        if (!serviceAccount.project_id && !serviceAccount.projectId) {
          throw new Error("❌ project_id não encontrado nas credenciais");
        }
        if (!serviceAccount.client_email && !serviceAccount.clientEmail) {
          throw new Error("❌ client_email não encontrado nas credenciais");
        }
        if (!serviceAccount.private_key && !serviceAccount.privateKey) {
          throw new Error("❌ private_key não encontrada nas credenciais");
        }

        // Normalizar campos para o formato esperado pelo cert()
        const credentials = {
          projectId: serviceAccount.project_id || serviceAccount.projectId,
          clientEmail:
            serviceAccount.client_email || serviceAccount.clientEmail,
          privateKey: serviceAccount.private_key || serviceAccount.privateKey,
        };

        // Inicializar Firebase Admin
        firebaseAdmin = initializeApp({
          credential: cert(credentials),
        });

        console.log("✅ Firebase Admin inicializado com sucesso!");
        console.log(`📋 Projeto: ${credentials.projectId}`);
      } catch (error) {
        console.error("❌ Erro ao inicializar Firebase Admin:", error);
        throw error;
      }
    } else {
      firebaseAdmin = getApps()[0];
    }
  }
  return firebaseAdmin;
};
