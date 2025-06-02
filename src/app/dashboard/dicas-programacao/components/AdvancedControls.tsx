import React, { useState } from "react";

interface AdvancedControlsProps {
  properties: {
    flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
    flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
    gap?: string;
    padding?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
  onPropertyChange: (property: string, value: string) => void;
  onReset: () => void;
  onRandomize: () => void;
  onExportCSS: () => void;
  className?: string;
}

export default function AdvancedControls({
  properties,
  onPropertyChange,
  onReset,
  onRandomize,
  onExportCSS,
  className = "",
}: AdvancedControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("properties");

  // Configurações avançadas por tipo de propriedade
  const propertyConfigs = {
    // Flexbox properties
    flexDirection: {
      type: "select",
      label: "Flex Direction",
      options: ["row", "row-reverse", "column", "column-reverse"],
      description: "Define a direção principal do layout flex",
    },
    justifyContent: {
      type: "select",
      label: "Justify Content",
      options: [
        "flex-start",
        "flex-end",
        "center",
        "space-between",
        "space-around",
        "space-evenly",
      ],
      description: "Alinha itens no eixo principal",
    },
    alignItems: {
      type: "select",
      label: "Align Items",
      options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
      description: "Alinha itens no eixo transversal",
    },
    flexWrap: {
      type: "select",
      label: "Flex Wrap",
      options: ["nowrap", "wrap", "wrap-reverse"],
      description: "Controla se os itens quebram linha",
    },
    gap: {
      type: "range",
      label: "Gap",
      min: 0,
      max: 50,
      step: 5,
      unit: "px",
      description: "Espaçamento entre os itens",
    },

    // Grid properties
    gridTemplateColumns: {
      type: "text",
      label: "Grid Columns",
      placeholder: "repeat(3, 1fr)",
      description: "Define as colunas do grid",
    },
    gridTemplateRows: {
      type: "text",
      label: "Grid Rows",
      placeholder: "repeat(3, 100px)",
      description: "Define as linhas do grid",
    },

    // Visual properties
    padding: {
      type: "range",
      label: "Padding",
      min: 0,
      max: 50,
      step: 5,
      unit: "px",
      description: "Espaçamento interno",
    },
    borderRadius: {
      type: "range",
      label: "Border Radius",
      min: 0,
      max: 50,
      step: 5,
      unit: "px",
      description: "Arredondamento das bordas",
    },
    backgroundColor: {
      type: "color",
      label: "Background Color",
      description: "Cor de fundo",
    },
  };

  const renderControl = (propKey: string, config: any) => {
    const value = properties[propKey] || "";

    switch (config.type) {
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onPropertyChange(propKey, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {config.options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.step}
              value={parseInt(value) || config.min}
              onChange={(e) =>
                onPropertyChange(
                  propKey,
                  `${e.target.value}${config.unit || ""}`
                )
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                {config.min}
                {config.unit}
              </span>
              <span className="text-white font-semibold">
                {value || `${config.min}${config.unit}`}
              </span>
              <span>
                {config.max}
                {config.unit}
              </span>
            </div>
          </div>
        );

      case "color":
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value || "#3b82f6"}
              onChange={(e) => onPropertyChange(propKey, e.target.value)}
              className="w-12 h-10 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onPropertyChange(propKey, e.target.value)}
              placeholder="#3b82f6"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onPropertyChange(propKey, e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: "properties", label: "Propriedades", icon: "⚙️" },
    { id: "presets", label: "Presets", icon: "🎯" },
    { id: "export", label: "Exportar", icon: "📦" },
  ];

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/50 ${className}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛠️</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Controles Avançados
            </h3>
            <p className="text-sm text-gray-400">
              Personalize cada detalhe do seu layout
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRandomize();
            }}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            title="Valores aleatórios"
          >
            🎲
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            title="Reset"
          >
            🔄
          </button>
          <span
            className={`transform transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Conteúdo expandível */}
      {isExpanded && (
        <div className="border-t border-gray-600/50">
          {/* Tabs */}
          <div className="flex border-b border-gray-600/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "properties" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(propertyConfigs).map(([key, config]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-white">
                          {config.label}
                        </label>
                        <span
                          className="text-xs text-gray-400 cursor-help"
                          title={config.description}
                        >
                          ❓
                        </span>
                      </div>
                      {renderControl(key, config)}
                      {config.description && (
                        <p className="text-xs text-gray-500">
                          {config.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "presets" && (
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Presets Rápidos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    {
                      name: "Centro",
                      props: { justifyContent: "center", alignItems: "center" },
                    },
                    {
                      name: "Esquerda",
                      props: {
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                      },
                    },
                    {
                      name: "Direita",
                      props: {
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                      },
                    },
                    {
                      name: "Espaçado",
                      props: {
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    {
                      name: "Coluna",
                      props: { flexDirection: "column", alignItems: "center" },
                    },
                    {
                      name: "Wrap",
                      props: {
                        flexWrap: "wrap",
                        justifyContent: "space-around",
                      },
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        Object.entries(preset.props).forEach(([key, value]) => {
                          onPropertyChange(key, value);
                        });
                      }}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "export" && (
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Exportar CSS</h4>
                <button
                  onClick={onExportCSS}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  📋 Copiar CSS para Clipboard
                </button>
                <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300 font-mono">
                  <pre className="whitespace-pre-wrap">
                    {Object.entries(properties)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `  ${key}: ${value};`)
                      .join("\n")}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1e40af;
        }
      `}</style>
    </div>
  );
}
