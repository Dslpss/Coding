export interface Template {
  id: string;
  name: string;
  description: string;
  category: "layout" | "navigation" | "cards" | "forms" | "showcase";
  preview: string;
  difficulty: "básico" | "intermediário" | "avançado";  properties: {
    flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
    alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
    flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
    gap?: string;
    padding?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
  customCSS?: string;
  tags: string[];
}

// Templates para Flexbox
export const FLEXBOX_TEMPLATES: Template[] = [
  {
    id: "center-everything",
    name: "Centralizar Tudo",
    description: "Centraliza elementos vertical e horizontalmente",
    category: "layout",
    preview: "⊞",
    difficulty: "básico",
    properties: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "nowrap",
    },
    tags: ["centralização", "layout", "básico"],
  },
  {
    id: "navigation-bar",
    name: "Barra de Navegação",
    description: "Layout típico de navbar com logo à esquerda e menu à direita",
    category: "navigation",
    preview: "📊",
    difficulty: "básico",
    properties: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "nowrap",
    },
    tags: ["navegação", "header", "navbar"],
  },
  {
    id: "card-layout",
    name: "Layout de Cards",
    description: "Grid responsivo de cards que quebra linha quando necessário",
    category: "cards",
    preview: "🃏",
    difficulty: "intermediário",
    properties: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "stretch",
      flexWrap: "wrap",
    },
    tags: ["cards", "grid", "responsivo"],
  },
  {
    id: "sidebar-layout",
    name: "Layout com Sidebar",
    description: "Layout com sidebar fixa e conteúdo principal",
    category: "layout",
    preview: "📋",
    difficulty: "intermediário",
    properties: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "stretch",
      flexWrap: "nowrap",
    },
    tags: ["sidebar", "layout", "dashboard"],
  },
  {
    id: "footer-bottom",
    name: "Footer no Final",
    description: "Mantém o footer sempre no final da página",
    category: "layout",
    preview: "⬇",
    difficulty: "avançado",
    properties: {
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "stretch",
      flexWrap: "nowrap",
    },
    customCSS: "min-height: 100vh;",
    tags: ["footer", "sticky", "layout"],
  },
  {
    id: "gallery-masonry",
    name: "Galeria Masonry",
    description: "Layout estilo Pinterest para imagens",
    category: "showcase",
    preview: "🖼",
    difficulty: "avançado",
    properties: {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      flexWrap: "wrap",
    },
    tags: ["galeria", "imagens", "masonry"],
  },
];

// Templates para CSS Grid
export const GRID_TEMPLATES: Template[] = [
  {
    id: "basic-grid",
    name: "Grid Básico",
    description: "Grid simples 3x3 com espaçamento uniforme",
    category: "layout",
    preview: "⚏",
    difficulty: "básico",
    properties: {
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(3, 100px)",
      gap: "1rem",
    },
    tags: ["grid", "básico", "uniforme"],
  },
  {
    id: "holy-grail",
    name: "Holy Grail Layout",
    description: "Layout clássico com header, footer, sidebar e main",
    category: "layout",
    preview: "🏛",
    difficulty: "avançado",
    properties: {
      gridTemplateColumns: "200px 1fr 150px",
      gridTemplateRows: "auto 1fr auto",
      gap: "1rem",
      gridTemplateAreas:
        '"header header header" "sidebar main aside" "footer footer footer"',
    },
    customCSS: "min-height: 100vh;",
    tags: ["holy-grail", "layout", "completo"],
  },
  {
    id: "magazine-layout",
    name: "Layout de Revista",
    description: "Grid assimétrico estilo revista com áreas destacadas",
    category: "showcase",
    preview: "📰",
    difficulty: "avançado",
    properties: {
      gridTemplateColumns: "repeat(6, 1fr)",
      gridTemplateRows: "repeat(4, 150px)",
      gap: "1rem",
    },
    tags: ["revista", "assimétrico", "destacado"],
  },
  {
    id: "responsive-cards",
    name: "Cards Responsivos",
    description: "Grid de cards que se adapta ao tamanho da tela",
    category: "cards",
    preview: "📱",
    difficulty: "intermediário",
    properties: {
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gridTemplateRows: "auto",
      gap: "1.5rem",
    },
    tags: ["responsivo", "cards", "auto-fit"],
  },
];

// Templates para CSS em geral
export const CSS_TEMPLATES: Template[] = [
  {
    id: "gradient-buttons",
    name: "Botões com Gradiente",
    description: "Coleção de botões com gradientes e animações",
    category: "forms",
    preview: "🔘",
    difficulty: "intermediário",
    properties: {
      background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "8px",
      padding: "12px 24px",
      transition: "all 0.3s ease",
    },
    tags: ["botões", "gradiente", "animação"],
  },
  {
    id: "glass-morphism",
    name: "Efeito Glassmorphism",
    description: "Cards com efeito de vidro fosco moderno",
    category: "cards",
    preview: "🪟",
    difficulty: "avançado",
    properties: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    tags: ["glassmorphism", "moderno", "transparência"],
  },
];

// Função para obter templates por categoria
export function getTemplatesByCategory(category: string) {
  const allTemplates = [
    ...FLEXBOX_TEMPLATES,
    ...GRID_TEMPLATES,
    ...CSS_TEMPLATES,
  ];
  return allTemplates.filter((template) => template.category === category);
}

// Função para obter template por ID
export function getTemplateById(id: string) {
  const allTemplates = [
    ...FLEXBOX_TEMPLATES,
    ...GRID_TEMPLATES,
    ...CSS_TEMPLATES,
  ];
  return allTemplates.find((template) => template.id === id);
}

// Função para buscar templates por tags
export function searchTemplates(query: string) {
  const allTemplates = [
    ...FLEXBOX_TEMPLATES,
    ...GRID_TEMPLATES,
    ...CSS_TEMPLATES,
  ];
  const lowerQuery = query.toLowerCase();

  return allTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
