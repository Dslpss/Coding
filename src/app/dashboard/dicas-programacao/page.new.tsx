"use client";
import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDicasRefsHandlers } from "./dicas/DicasHandlers";
import NavigationSidebar from "./components/NavigationSidebar";
import PaginationControls, {
  usePagination,
} from "./components/PaginationControls";
import LazyLoadWrapper from "./components/LazyLoadWrapper";
import { TIPS_CONFIG, getTipStats } from "./config/tipsConfig";

// Importações dos componentes
import FlexboxContainerTip from "./dicas/FlexboxContainerTip";
import FlexboxItemsTip from "./dicas/FlexboxItemsTip";
import GridContainerTip from "./dicas/GridContainerTip";
import GridItemsTip from "./dicas/GridItemsTip";
import ResponsiveDesignTip from "./dicas/ResponsiveDesignTip";
import MediaQueriesTip from "./dicas/MediaQueriesTip";
import CssVariablesTip from "./dicas/CssVariablesTip";
import AnimationsTip from "./dicas/AnimationsTip";

export default function DicasProgramacaoPage() {
  // Estados para controle da interface
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [activeSection, setActiveSection] = useState("flexbox-container");
  const [itemsPerPage, setItemsPerPage] = useState(6);  const [viewMode, setViewMode] = useState<"all" | "paginated">("all");
  const [accordionMode, setAccordionMode] = useState(true); // Controla o modo accordion

  // Efeito para limpar seções expandidas quando mudar para modo accordion
  React.useEffect(() => {
    if (accordionMode) {
      // Quando ativar o modo accordion, manter apenas a primeira seção expandida
      const expandedKeys = Object.keys(expandedSections).filter(key => expandedSections[key]);
      if (expandedKeys.length > 1) {
        // Se há mais de uma seção expandida, manter apenas a primeira
        const firstExpanded = expandedKeys[0];
        setExpandedSections({ [firstExpanded]: true });
      }
    }
  }, [accordionMode]);

  // Hook de paginação
  const { currentPage, totalPages, paginatedItems, goToPage } = usePagination(
    TIPS_CONFIG,
    itemsPerPage
  );

  // Hooks centralizados para refs e handlers das dicas
  const dicas = useDicasRefsHandlers();
  // Funções de controle
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      if (accordionMode) {
        // Modo accordion: apenas uma seção expandida por vez
        const isCurrentlyExpanded = prev[sectionId];
        if (isCurrentlyExpanded) {
          // Se já está expandida, apenas fecha ela - retorna objeto vazio
          return {};
        } else {
          // Se não está expandida, fecha TODAS as outras e abre apenas esta
          return { [sectionId]: true };
        }
      } else {
        // Modo livre: múltiplas seções podem estar expandidas
        return {
          ...prev,
          [sectionId]: !prev[sectionId],
        };
      }
    });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Preparar props para cada componente
  const getComponentProps = (tipId: string) => {
    const baseProps = {
      expanded: expandedSections[tipId],
      toggle: () => toggleSection(tipId),
    };

    switch (tipId) {
      case "flexbox-container":
        return {
          ...baseProps,
          flexDirectionRef: dicas.flexDirectionRef,
          justifyContentRef: dicas.justifyContentRef,
          alignItemsRef: dicas.alignItemsRef,
          flexWrapRef: dicas.flexWrapRef,
          flexDirectionValue: dicas.flexDirectionValue,
          justifyContentValue: dicas.justifyContentValue,
          alignItemsValue: dicas.alignItemsValue,
          flexWrapValue: dicas.flexWrapValue,
          handleFlexDirection: dicas.handleFlexDirection,
          handleJustifyContent: dicas.handleJustifyContent,
          handleAlignItems: dicas.handleAlignItems,
          handleFlexWrap: dicas.handleFlexWrap,
        };
      case "flexbox-items":
        return {
          ...baseProps,
          orderRefs: dicas.orderRefs,
          growRefs: dicas.growRefs,
          orderValues: dicas.orderValues,
          growValues: dicas.growValues,
          handleOrder: dicas.handleOrder,
          handleGrow: dicas.handleGrow,
        };
      case "grid-container":
        return {
          ...baseProps,
          gridColsRef: dicas.gridColsRef,
          gridRowsRef: dicas.gridRowsRef,
          gridGapRef: dicas.gridGapRef,
          gridColsValue: dicas.gridColsValue,
          gridRowsValue: dicas.gridRowsValue,
          gridGapValue: dicas.gridGapValue,
          handleGridCols: dicas.handleGridCols,
          handleGridRows: dicas.handleGridRows,
          handleGridGap: dicas.handleGridGap,
        };
      case "grid-items":
        return {
          ...baseProps,
          gridPosItemBRef: dicas.gridPosItemBRef,
          gridSelfItemBRef: dicas.gridSelfItemBRef,
          gridColItemBValue: dicas.gridColItemBValue,
          gridRowItemBValue: dicas.gridRowItemBValue,
          gridJustifySelfValue: dicas.gridJustifySelfValue,
          gridAlignSelfValue: dicas.gridAlignSelfValue,
          handleGridColItemB: dicas.handleGridColItemB,
          handleGridRowItemB: dicas.handleGridRowItemB,
          handleGridJustifySelf: dicas.handleGridJustifySelf,
          handleGridAlignSelf: dicas.handleGridAlignSelf,
        };
      default:
        return baseProps;
    }
  };
  // Renderizar componente baseado no ID
  const renderTipComponent = (tip: (typeof TIPS_CONFIG)[0]) => {
    const props = getComponentProps(tip.id);

    switch (tip.id) {
      case "flexbox-container":
        return <FlexboxContainerTip {...(props as any)} />;
      case "flexbox-items":
        return <FlexboxItemsTip {...(props as any)} />;
      case "grid-container":
        return <GridContainerTip {...(props as any)} />;
      case "grid-items":
        return <GridItemsTip {...(props as any)} />;
      case "responsive-design":
        return <ResponsiveDesignTip {...(props as any)} />;
      case "media-queries":
        return <MediaQueriesTip {...(props as any)} />;
      case "css-variables":
        return <CssVariablesTip {...(props as any)} />;
      case "animations":
        return <AnimationsTip {...(props as any)} />;
      default:
        return null;
    }
  };
  const stats = getTipStats();
  const tipsToRender = viewMode === "paginated" ? paginatedItems : TIPS_CONFIG;
  // Debug: mostrar estado das seções expandidas
  React.useEffect(() => {
    console.log('🔍 Estado das seções expandidas:', expandedSections);
    console.log('🎯 Modo accordion:', accordionMode);
    const expandedCount = Object.values(expandedSections).filter(Boolean).length;
    console.log('📊 Número de seções expandidas:', expandedCount);
    
    // Debug adicional: mostrar quais seções estão expandidas
    const expandedIds = Object.keys(expandedSections).filter(key => expandedSections[key]);
    console.log('🎪 Seções expandidas:', expandedIds);
    
    // Verificar se há mais de uma seção expandida no modo accordion
    if (accordionMode && expandedCount > 1) {
      console.warn('⚠️ PROBLEMA: Múltiplas seções expandidas no modo accordion!', expandedIds);
    }
  }, [expandedSections, accordionMode]);

  return (    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <style jsx>{`
        /* Estilos de navegação */
        .nav-sidebar {
          position: sticky;
          top: 1rem;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
          width: 320px;
          background-color: rgba(30, 41, 59, 0.9);
          border-radius: 0.75rem;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          padding: 1.5rem;
          margin-right: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
        }

        .content-area {
          flex: 1;
          min-width: 0;
        }        /* Estilos para controle de expansão das seções */
        .section-content {
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .section-content.expanded {
          display: block;
          opacity: 1;
          animation: slideDown 0.3s ease-in-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Estilos do cabeçalho da seção */
        .section-header {
          cursor: pointer;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 0.75rem 0.75rem 0 0;
          transition: all 0.3s ease;
        }

        .section-header:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .section-header .icon {
          transition: transform 0.3s ease;
          font-size: 1.2rem;
          color: #60a5fa;
        }

        .section-header .icon.expanded {
          transform: rotate(180deg);
        }

        /* Estilos responsivos */
        @media (max-width: 1024px) {
          .nav-sidebar {
            width: 100%;
            position: static;
            margin-right: 0;
            margin-bottom: 1.5rem;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200 mb-4"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>

        <motion.header
          className="text-center mb-10"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 inline-block text-transparent bg-clip-text">
            Guia Interativo de CSS
          </h1>
          <p className="text-xl text-blue-200 mt-2 max-w-2xl mx-auto">
            Explore propriedades CSS interativamente e veja em tempo real como
            elas afetam o layout.
          </p>

          {/* Estatísticas */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-blue-300">
                {stats.total}
              </div>
              <div className="text-sm text-gray-300">Dicas Disponíveis</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-green-300">
                {stats.featured}
              </div>
              <div className="text-sm text-gray-300">Em Destaque</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-purple-300">
                {stats.totalEstimatedTime}min
              </div>
              <div className="text-sm text-gray-300">Tempo Total</div>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Navegação */}
          <motion.aside
            className="lg:w-80"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <NavigationSidebar
              activeSection={activeSection}
              onSectionChange={scrollToSection}
              navigationItems={TIPS_CONFIG.map((tip) => ({
                id: tip.id,
                title: tip.title,
                category: tip.category,
                emoji: tip.emoji,
                difficulty: tip.difficulty,
                tags: tip.tags,
              }))}
            />
          </motion.aside>

          {/* Conteúdo Principal */}
          <motion.main
            className="flex-1"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >            {/* Controles de Visualização */}
            <div className="mb-6 space-y-4">
              {/* Primeira linha de controles */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Ver Todas ({TIPS_CONFIG.length})
                  </button>
                  <button
                    onClick={() => setViewMode("paginated")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      viewMode === "paginated"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Paginado
                  </button>
                </div>

                {viewMode === "paginated" && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300">
                      Itens por página:
                    </label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value={3}>3</option>
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                    </select>
                  </div>
                )}
              </div>              {/* Segunda linha - Controles de expansão */}
              <div className="flex items-center gap-4 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Modo de Expansão:</span>
                  <button
                    onClick={() => {
                      setAccordionMode(true);
                      // Ao ativar accordion, fechar todas exceto a primeira expandida
                      const expandedKeys = Object.keys(expandedSections).filter(key => expandedSections[key]);
                      if (expandedKeys.length > 1) {
                        setExpandedSections({ [expandedKeys[0]]: true });
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      accordionMode
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    🎯 Accordion {accordionMode && '(Ativo)'}
                  </button>
                  <button
                    onClick={() => setAccordionMode(false)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      !accordionMode
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    📚 Livre {!accordionMode && '(Ativo)'}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setExpandedSections({})}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-all"
                  >
                    🔒 Fechar Todas
                  </button>
                  {!accordionMode && (
                    <button
                      onClick={() => {
                        const allExpanded = TIPS_CONFIG.reduce((acc, tip) => {
                          acc[tip.id] = true;
                          return acc;
                        }, {} as Record<string, boolean>);
                        setExpandedSections(allExpanded);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all"
                    >
                      🔓 Abrir Todas
                    </button>
                  )}
                  {accordionMode && (
                    <div className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
                      ⚡ Uma por vez
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Dicas */}
            <div className="space-y-6">
              {tipsToRender.map((tip) => (
                <LazyLoadWrapper key={tip.id} id={tip.id}>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center py-12 bg-gray-800/20 rounded-xl border border-gray-700">
                          <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">
                              Carregando {tip.title}...
                            </p>
                          </div>
                        </div>
                      }
                    >
                      {renderTipComponent(tip)}
                    </Suspense>
                  </motion.div>
                </LazyLoadWrapper>
              ))}
            </div>

            {/* Paginação */}
            {viewMode === "paginated" && (
              <PaginationControls
                totalItems={TIPS_CONFIG.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={goToPage}
              />
            )}

            {/* Botão para carregar mais (modo alternativo) */}
            {viewMode === "all" && TIPS_CONFIG.length > 6 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setViewMode("paginated")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
                >
                  Usar Paginação Para Melhor Performance
                </button>
              </div>
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
