"use client";
import { useEffect, useState, useCallback } from "react";
import {
  FaSave,
  FaCog,
  FaDatabase,
  FaShieldAlt,
  FaPalette,
  FaBell,
  FaUsers,
  FaServer,
} from "react-icons/fa";
import AlertBanner from "../components/AlertBanner";

interface ConfigSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  emailNotifications: boolean;
  adminEmail: string;
  backupFrequency: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  themeColor: string;
  enableAnalytics: boolean;
}

function AdminConfiguracoesPage() {
  const [settings, setSettings] = useState<ConfigSettings>({
    siteName: "Self Coding",
    siteDescription: "Plataforma de ensino de programação",
    maintenanceMode: false,
    allowRegistration: true,
    maxUploadSize: 5,
    emailNotifications: true,
    adminEmail: "admin@selfcoding.com",
    backupFrequency: "daily",
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    themeColor: "#3B82F6",
    enableAnalytics: true,
  });

  const [originalSettings, setOriginalSettings] = useState<ConfigSettings>(
    {} as ConfigSettings
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("geral");
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔍 Buscando configurações via API...");

      const response = await fetch("/api/admin/config", {
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Erro ao carregar configurações";

        if (response.status === 401) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (response.status === 403) {
          errorMessage = "Acesso negado. Permissões insuficientes.";
        } else {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }

        setError(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("✅ Configurações carregadas:", data.data);

      if (data.success && data.data) {
        setSettings(data.data);
        setOriginalSettings(data.data);
      } else {
        setError("Formato de resposta inválido da API");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error);
      setError(
        "Erro de conexão: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSettings, setOriginalSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const changed =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);
  async function saveSettings() {
    if (!hasChanges) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("💾 Salvando configurações via API...");

      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao salvar configurações";

        if (response.status === 401) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (response.status === 403) {
          errorMessage = "Acesso negado. Permissões insuficientes.";
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || `Erro ${response.status}`;
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
          }
        }

        setError(errorMessage);
        return;
      }

      const data = await response.json();
      console.log("✅ Configurações salvas:", data);

      if (data.success) {
        setOriginalSettings(settings);
        setSuccess("Configurações salvas com sucesso!");

        // Auto-esconder mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "Erro desconhecido ao salvar");
      }
    } catch (error) {
      console.error("❌ Erro ao salvar configurações:", error);
      setError(
        "Erro de conexão: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetToDefaults() {
    if (
      !confirm(
        "Tem certeza que deseja resetar todas as configurações para os valores padrão? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔄 Resetando configurações para padrão...");

      const response = await fetch("/api/admin/config", {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ${response.status}`);
        }
      }

      const data = await response.json();
      console.log("✅ Configurações resetadas:", data);

      if (data.success && data.data) {
        setSettings(data.data);
        setOriginalSettings(data.data);
        setSuccess("Configurações resetadas para os valores padrão!");

        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (error) {
      console.error("❌ Erro ao resetar configurações:", error);
      setError(
        "Erro ao resetar configurações: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      );
    } finally {
      setLoading(false);
    }
  }

  function resetSettings() {
    setSettings(originalSettings);
  }
  interface TabConfig {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  const tabs: TabConfig[] = [
    { id: "geral", label: "Geral", icon: FaCog },
    { id: "seguranca", label: "Segurança", icon: FaShieldAlt },
    { id: "sistema", label: "Sistema", icon: FaServer },
    { id: "aparencia", label: "Aparência", icon: FaPalette },
  ];
  const TabButton = ({
    tab,
    isActive,
    onClick,
  }: {
    tab: TabConfig;
    isActive: boolean;
    onClick: () => void;
  }) => {
    const IconComponent = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        <IconComponent className="mr-2" />
        {tab.label}
      </button>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {" "}
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          Configurações do Sistema
        </h1>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resetar Padrão
          </button>
          {hasChanges && (
            <button
              onClick={resetSettings}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges || loading}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              hasChanges && !loading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            <FaSave className="mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
      {/* Alerts */}
      {error && (
        <AlertBanner
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <AlertBanner
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>{" "}
      {/* Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
            <div className="flex items-center gap-3 bg-gray-800 px-6 py-4 rounded-lg">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Carregando configurações...</span>
            </div>
          </div>
        )}

        {hasChanges && (
          <div className="mb-6 p-4 bg-yellow-900 bg-opacity-50 border border-yellow-600 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-200 text-sm">
                Você tem alterações não salvas
              </span>
            </div>
          </div>
        )}
        {/* Aba Geral */}
        {activeTab === "geral" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Configurações Gerais
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-gray-300 mb-2">Nome do Site</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Email do Administrador
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, adminEmail: e.target.value })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 mb-2">
                  Descrição do Site
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteDescription: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FaUsers className="text-blue-400 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">
                      Permitir Registro de Novos Usuários
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Usuários podem criar novas contas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      allowRegistration: !settings.allowRegistration,
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.allowRegistration ? "bg-blue-600" : "bg-gray-500"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.allowRegistration
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <FaBell className="text-yellow-400 mr-3" />
                  <div>
                    <h3 className="text-white font-medium">
                      Notificações por Email
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Receber notificações sobre atividades importantes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      emailNotifications: !settings.emailNotifications,
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.emailNotifications ? "bg-blue-600" : "bg-gray-500"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.emailNotifications
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aba Segurança */}
        {activeTab === "seguranca" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Configurações de Segurança
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-gray-300 mb-2">
                  Timeout da Sessão (minutos)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeout: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Máximo de Tentativas de Login
                </label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxLoginAttempts: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FaShieldAlt className="text-red-400 mr-3" />
                <div>
                  <h3 className="text-white font-medium">Modo de Manutenção</h3>
                  <p className="text-gray-400 text-sm">
                    Bloquear acesso ao site para manutenção
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.maintenanceMode ? "bg-red-600" : "bg-gray-500"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.maintenanceMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Aba Sistema */}
        {activeTab === "sistema" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Configurações do Sistema
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-gray-300 mb-2">
                  Tamanho Máximo de Upload (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxUploadSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">
                  Frequência de Backup
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      backupFrequency: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <FaDatabase className="text-green-400 mr-3" />
                <div>
                  <h3 className="text-white font-medium">
                    Habilitar Analytics
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Coletar dados de uso para melhorias
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    enableAnalytics: !settings.enableAnalytics,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.enableAnalytics ? "bg-blue-600" : "bg-gray-500"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.enableAnalytics ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Aba Aparência */}
        {activeTab === "aparencia" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Configurações de Aparência
            </h2>
            <div>
              <label className="block text-gray-300 mb-2">Cor do Tema</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.themeColor}
                  onChange={(e) =>
                    setSettings({ ...settings, themeColor: e.target.value })
                  }
                  className="w-16 h-12 bg-gray-700 rounded-lg border border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.themeColor}
                  onChange={(e) =>
                    setSettings({ ...settings, themeColor: e.target.value })
                  }
                  className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="#3B82F6"
                />
              </div>
            </div>{" "}
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="text-white font-medium mb-2">Prévia do Tema</h3>
              <div className="flex gap-4">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-gray-600"
                  style={{ backgroundColor: settings.themeColor }}
                />
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">
                    Esta será a cor principal utilizada nos elementos da
                    interface, como botões, links e destaques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminConfiguracoesPage;
