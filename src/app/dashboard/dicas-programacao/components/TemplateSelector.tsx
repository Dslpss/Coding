import React, { useState } from "react";
import { Template } from "../config/templatesConfig";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string | null;
  onTemplateSelect: (template: Template) => void;
  onCustomMode: () => void;
  className?: string;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onCustomMode,
  className = "",
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrar templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Obter categorias únicas
  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "básico":
        return "text-green-400 bg-green-400/20";
      case "intermediário":
        return "text-yellow-400 bg-yellow-400/20";
      case "avançado":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "layout":
        return "📐";
      case "navigation":
        return "🧭";
      case "cards":
        return "🃏";
      case "forms":
        return "📝";
      case "showcase":
        return "🎨";
      default:
        return "✨";
    }
  };

  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/50 ${className}`}
    >
      {/* Header com toggle */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Templates Prontos
            </h3>
            <p className="text-sm text-gray-400">
              {filteredTemplates.length} templates disponíveis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCustomMode();
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Modo Custom
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
          {/* Controles de filtro */}
          <div className="p-4 bg-gray-900/30">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Busca */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtro de categoria */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as categorias</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {getCategoryEmoji(category)}{" "}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de templates */}
          <div className="p-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">🔍</span>
                <p className="text-gray-400">Nenhum template encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => onTemplateSelect(template)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-105 ${
                      selectedTemplate === template.id
                        ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25"
                        : "border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
                    }`}
                  >
                    {/* Header do card */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{template.preview}</span>
                        <span className="text-xs">
                          {getCategoryEmoji(template.category)}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                          template.difficulty
                        )}`}
                      >
                        {template.difficulty}
                      </span>
                    </div>

                    {/* Nome e descrição */}
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer com informações */}
          <div className="px-4 py-3 bg-gray-900/30 border-t border-gray-600/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>
                💡 Clique em um template para aplicá-lo instantaneamente
              </span>
              <span>
                {filteredTemplates.length} de {templates.length} templates
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
