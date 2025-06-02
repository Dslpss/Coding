import React, { useState } from "react";

interface NavigationItem {
  id: string;
  title: string;
  category: string;
  emoji: string;
  difficulty: "básico" | "intermediário" | "avançado";
  tags: string[];
}

interface NavigationSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  navigationItems: NavigationItem[];
}

export default function NavigationSidebar({
  activeSection,
  onSectionChange,
  navigationItems,
}: NavigationSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("todos");

  // Categorias disponíveis
  const categories = [
    "todos",
    ...Array.from(new Set(navigationItems.map((item) => item.category))),
  ];
  const difficulties = ["todos", "básico", "intermediário", "avançado"];

  // Filtrar itens baseado nos critérios
  const filteredItems = navigationItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "todos" || item.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "todos" || item.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Agrupar por categoria
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "básico":
        return "text-green-400";
      case "intermediário":
        return "text-yellow-400";
      case "avançado":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="navigation-sidebar">
      <div className="sticky top-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center gap-2">
            📚 Navegação
          </h3>

          {/* Busca */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar dicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filtros */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Dificuldade
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de navegação */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2 border-b border-gray-700 pb-1">
                  {category}
                </h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${
                        activeSection === item.id
                          ? "bg-blue-600/50 text-blue-200 border border-blue-500/50"
                          : "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{item.title}</div>
                        <div
                          className={`text-xs ${getDifficultyColor(
                            item.difficulty
                          )}`}
                        >
                          {item.difficulty}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">
              {filteredItems.length} de {navigationItems.length} dicas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
