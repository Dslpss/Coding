// Script para validar o middleware de redirecionamento quando em manutenção
// Deve ser executado com o sistema em execução: node test-middleware-maint.js

const axios = require("axios");
const colors = require("colors");

// Configuração
const baseUrl = "http://localhost:3000";
const endpoints = [
  "/dashboard",
  "/auth",
  "/site-em-manutencao",
  "/admin/configuracoes",
];

colors.setTheme({
  info: "blue",
  help: "cyan",
  warn: "yellow",
  success: "green",
  error: "red",
});

// Função para validar o middleware
async function testMiddleware() {
  try {
    console.log(
      colors.cyan("▶️ Iniciando teste do middleware de manutenção...\n")
    );

    // Verificar status atual do modo de manutenção
    console.log(colors.info("⏱️ Verificando configurações do sistema..."));
    const settingsResponse = await axios.get(`${baseUrl}/api/auth/settings`);
    const { maintenanceMode } = settingsResponse.data;

    console.log(
      colors.info(
        `ℹ️ Modo de manutenção está ${
          maintenanceMode
            ? colors.yellow("ATIVADO")
            : colors.green("DESATIVADO")
        }\n`
      )
    );

    // Testar cada endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(colors.info(`🔍 Testando acesso a ${endpoint}...`));

        const response = await axios.get(`${baseUrl}${endpoint}`, {
          maxRedirects: 0,
          validateStatus: (status) => true, // Aceitar qualquer status para capturar redirecionamentos
        });

        console.log(`   Status: ${response.status}`);

        if (
          response.status >= 300 &&
          response.status < 400 &&
          response.headers.location
        ) {
          console.log(
            colors.yellow(
              `   Redirecionamento detectado para: ${response.headers.location}`
            )
          );

          // Verificar se o redirecionamento está correto
          if (maintenanceMode) {
            if (
              endpoint !== "/site-em-manutencao" &&
              response.headers.location.includes("/site-em-manutencao")
            ) {
              console.log(
                colors.success(
                  `   ✅ CORRETO: Redirecionamento para página de manutenção`
                )
              );
            } else if (endpoint === "/site-em-manutencao") {
              console.log(
                colors.warn(
                  `   ⚠️ ESPERADO: A página de manutenção não deve redirecionar`
                )
              );
            }
          } else if (
            endpoint !== "/site-em-manutencao" &&
            response.headers.location.includes("/site-em-manutencao")
          ) {
            console.log(
              colors.error(
                `   ❌ INCORRETO: Não deveria redirecionar para manutenção`
              )
            );
          }
        } else if (
          maintenanceMode &&
          endpoint !== "/site-em-manutencao" &&
          endpoint !== "/admin/configuracoes" &&
          !response.headers.location
        ) {
          console.log(
            colors.error(
              `   ❌ FALHA: Deveria ter redirecionado para manutenção`
            )
          );
        } else if (!maintenanceMode && !response.headers.location) {
          console.log(
            colors.success(`   ✅ CORRETO: Acesso direto sem redirecionamento`)
          );
        }
      } catch (endpointError) {
        console.log(
          colors.error(
            `   ❌ Erro ao testar ${endpoint}: ${endpointError.message}`
          )
        );
      }

      console.log(""); // Linha em branco para separar os testes
    }

    console.log(colors.cyan("✅ Testes finalizados!"));
    console.log(
      colors.help(`
Para alternar o modo de manutenção, execute:
node test-maintenance-redirection.js ${maintenanceMode ? "desativar" : ""}
    `)
    );
  } catch (error) {
    console.error(colors.error("Erro durante o teste:"), error.message);
  }
}

testMiddleware();
