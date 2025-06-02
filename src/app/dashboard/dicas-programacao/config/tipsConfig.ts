import React from "react";

// Tipos para as dicas
export interface TipConfig {
  id: string;
  title: string;
  category: string;
  emoji: string;
  difficulty: "básico" | "intermediário" | "avançado";
  tags: string[];
  component: React.LazyExoticComponent<any> | React.ComponentType<any>;
  props?: Record<string, any>;
  featured?: boolean;
  description?: string;
  estimatedReadTime?: number; // em minutos
}

// Lazy loading dos componentes de dicas
const FlexboxContainerTip = React.lazy(
  () => import("../dicas/FlexboxContainerTip")
);
const FlexboxItemsTip = React.lazy(() => import("../dicas/FlexboxItemsTip"));
const GridContainerTip = React.lazy(() => import("../dicas/GridContainerTip"));
const GridItemsTip = React.lazy(() => import("../dicas/GridItemsTip"));
const ResponsiveDesignTip = React.lazy(
  () => import("../dicas/ResponsiveDesignTip")
);
const MediaQueriesTip = React.lazy(() => import("../dicas/MediaQueriesTip"));
const CssVariablesTip = React.lazy(() => import("../dicas/CssVariablesTip"));
const AnimationsTip = React.lazy(() => import("../dicas/AnimationsTip"));

// Configuração de todas as dicas disponíveis
export const TIPS_CONFIG: TipConfig[] = [
  // === FLEXBOX ===
  {
    id: "flexbox-container",
    title: "Propriedades do Container Flex",
    category: "flexbox",
    emoji: "🔀",
    difficulty: "básico",
    tags: ["flexbox", "layout", "container", "display"],
    component: FlexboxContainerTip,
    featured: true,
    description:
      "Aprenda as propriedades fundamentais para controlar containers flexbox",
    estimatedReadTime: 8,
  },
  {
    id: "flexbox-items",
    title: "Propriedades dos Itens Flex",
    category: "flexbox",
    emoji: "📐",
    difficulty: "básico",
    tags: ["flexbox", "items", "order", "grow", "shrink"],
    component: FlexboxItemsTip,
    description: "Controle individual dos itens dentro de um container flexbox",
    estimatedReadTime: 6,
  },

  // === CSS GRID ===
  {
    id: "grid-container",
    title: "Propriedades do Container Grid",
    category: "grid",
    emoji: "📊",
    difficulty: "intermediário",
    tags: ["grid", "layout", "container", "columns", "rows"],
    component: GridContainerTip,
    featured: true,
    description: "Domine o CSS Grid criando layouts complexos e responsivos",
    estimatedReadTime: 10,
  },
  {
    id: "grid-items",
    title: "Propriedades dos Itens Grid",
    category: "grid",
    emoji: "🎯",
    difficulty: "intermediário",
    tags: ["grid", "items", "position", "align", "justify"],
    component: GridItemsTip,
    description: "Posicione e alinhe itens individualmente no grid",
    estimatedReadTime: 8,
  },

  // === DESIGN RESPONSIVO ===
  {
    id: "responsive-design",
    title: "Design Responsivo",
    category: "responsivo",
    emoji: "📱",
    difficulty: "intermediário",
    tags: ["responsive", "mobile", "tablet", "desktop", "viewport"],
    component: ResponsiveDesignTip,
    featured: true,
    description:
      "Técnicas para criar layouts que se adaptam a diferentes telas",
    estimatedReadTime: 12,
  },
  {
    id: "media-queries",
    title: "Media Queries",
    category: "responsivo",
    emoji: "📺",
    difficulty: "básico",
    tags: ["media-queries", "breakpoints", "responsive", "css"],
    component: MediaQueriesTip,
    description: "Use media queries para aplicar estilos condicionais",
    estimatedReadTime: 7,
  },

  // === CSS AVANÇADO ===
  {
    id: "css-variables",
    title: "Variáveis CSS (Custom Properties)",
    category: "avançado",
    emoji: "🎨",
    difficulty: "intermediário",
    tags: ["css-variables", "custom-properties", "themes", "dynamic"],
    component: CssVariablesTip,
    description: "Crie sistemas de design dinâmicos com variáveis CSS",
    estimatedReadTime: 9,
  },
  {
    id: "animations",
    title: "Animações e Transições",
    category: "avançado",
    emoji: "✨",
    difficulty: "avançado",
    tags: ["animations", "transitions", "keyframes", "performance"],
    component: AnimationsTip,
    featured: true,
    description: "Adicione vida aos seus layouts com animações suaves",
    estimatedReadTime: 15,
  },
];

// Funções auxiliares para trabalhar com as dicas
export const getTipsByCategory = (category: string) =>
  TIPS_CONFIG.filter((tip) => tip.category === category);

export const getFeaturedTips = () => TIPS_CONFIG.filter((tip) => tip.featured);

export const getTipsByDifficulty = (difficulty: string) =>
  TIPS_CONFIG.filter((tip) => tip.difficulty === difficulty);

export const searchTips = (query: string) =>
  TIPS_CONFIG.filter(
    (tip) =>
      tip.title.toLowerCase().includes(query.toLowerCase()) ||
      tip.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
      tip.description?.toLowerCase().includes(query.toLowerCase())
  );

export const getTipById = (id: string) =>
  TIPS_CONFIG.find((tip) => tip.id === id);

export const getCategories = () =>
  Array.from(new Set(TIPS_CONFIG.map((tip) => tip.category)));

export const getDifficulties = () =>
  Array.from(new Set(TIPS_CONFIG.map((tip) => tip.difficulty)));

// Estatísticas das dicas
export const getTipStats = () => ({
  total: TIPS_CONFIG.length,
  byCategory: getCategories().reduce((acc, cat) => {
    acc[cat] = getTipsByCategory(cat).length;
    return acc;
  }, {} as Record<string, number>),
  byDifficulty: getDifficulties().reduce((acc, diff) => {
    acc[diff] = getTipsByDifficulty(diff).length;
    return acc;
  }, {} as Record<string, number>),
  featured: getFeaturedTips().length,
  totalEstimatedTime: TIPS_CONFIG.reduce(
    (acc, tip) => acc + (tip.estimatedReadTime || 0),
    0
  ),
});
