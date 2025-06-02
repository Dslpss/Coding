"use client";
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useDicasRefsHandlers } from "./dicas/DicasHandlers";
import NavigationSidebar from "./components/NavigationSidebar";
import PaginationControls, { usePagination } from "./components/PaginationControls";
import LazyLoadWrapper from "./components/LazyLoadWrapper";
import { TIPS_CONFIG } from "./config/tipsConfig";

export default function DicasProgramacaoPage() {
  // Estados para controle da interface
  const [expandedSections, setExpandedSections] = React.useState<string | null>(null);
  const [activeSection, setActiveSection] = React.useState("flexbox-container");
  const [itemsPerPage, setItemsPerPage] = React.useState(6);
  const [viewMode, setViewMode] = React.useState<'all' | 'paginated'>('paginated');

  // Hook de paginação
  const { 
    currentPage, 
    totalPages, 
    paginatedItems, 
    goToPage 
  } = usePagination(TIPS_CONFIG, itemsPerPage);

  // Função para alternar a expansão de uma seção
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => prev === sectionId ? null : sectionId);
  };

  // Função para scroll suave até uma seção
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hooks centralizados para refs e handlers das dicas
  const dicas = useDicasRefsHandlers();

  // Preparar props para cada componente
  const getComponentProps = (tipId: string) => {
    const baseProps = {
      expanded: expandedSections === tipId,
      toggle: () => toggleSection(tipId)
    };

    switch (tipId) {
      case 'flexbox-container':
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
      case 'flexbox-items':
        return {
          ...baseProps,
          orderRefs: dicas.orderRefs,
          growRefs: dicas.growRefs,
          orderValues: dicas.orderValues,
          growValues: dicas.growValues,
          handleOrder: dicas.handleOrder,
          handleGrow: dicas.handleGrow,
        };
      case 'grid-container':
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
      case 'grid-items':
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

  // Estilos extras
  const style = `
    .nav-sidebar {
      position: sticky;
      top: 1rem;
      max-height: calc(100vh - 2rem);
      overflow-y: auto;
      width: 280px;
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      margin-right: 1.5rem;
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
    }
    
    .nav-sidebar h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #bfdbfe;
    }
    
    .nav-sidebar ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    
    .nav-sidebar .nav-category {
      margin-bottom: 1rem;
    }
    
    .nav-sidebar .nav-category > span {
      display: block;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e2e8f0;
    }
      .nav-sidebar .nav-item {
      padding: 0.5rem 0.5rem;
      margin-bottom: 0.25rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      cursor: pointer;
      color: #cbd5e1;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    
    .nav-sidebar .nav-item:hover {
      background-color: #334155;
      color: #60a5fa;
      transform: translateX(3px);
    }
    
    .nav-sidebar .nav-item.active {
      background-color: #1e3a8a;
      color: #93c5fd;
      font-weight: 500;
      border-left: 3px solid #3b82f6;
    }
    
    .nav-sidebar .nav-item .icon {
      margin-right: 0.5rem;
      display: inline-flex;
      align-items: center;
      font-size: 1rem;
      color: #64748b;
    }
    
    .nav-sidebar .nav-item:hover .icon {
      color: #3b82f6;
    }
    
    @media (max-width: 768px) {
      .nav-sidebar {
        position: static;
        width: 100%;
        margin-right: 0;
        margin-bottom: 1.5rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .nav-sidebar {      background-color: rgba(30, 41, 59, 0.85);
      border-color: #334155;
      border-width: 1px;
      border-style: solid;
    }
    
    .nav-sidebar h3 {
      color: #60a5fa;
    }
    
    .nav-sidebar .nav-category > span {
      color: #e2e8f0;
      border-bottom-color: #475569;
    }
    
    .nav-sidebar .nav-item {
      color: #cbd5e1;
    }
    
    .nav-sidebar .nav-item:hover {
      background-color: #334155;
      color: #60a5fa;
    }
    
    .nav-sidebar .nav-item.active {
      background-color: #1e3a8a;
      color: #93c5fd;
    }
    
    .nav-sidebar .nav-item .icon {
      color: #94a3b8;
    }
    
    .nav-sidebar .nav-item:hover .icon {
      color: #60a5fa;
    }
    }
    
    .content-area {
      flex: 1;
    }      .flex-container, .grid-container-demo {
      background-color: rgba(15, 23, 42, 0.7);
      background-image: none;
      border: 2px solid rgba(59, 130, 246, 0.4);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      min-height: 150px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    .flex-container:hover, .grid-container-demo:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      transform: translateY(-2px);
      border-color: rgba(59, 130, 246, 0.6);
    }
      .flex-item, .grid-item-demo {
      background-color: #3b82f6;
      background-image: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 1rem;
      margin: 0.5rem;
      border-radius: 0.5rem;
      text-align: center;
      font-weight: 500;
      min-width: 60px;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
    
    .flex-item:hover, .grid-item-demo:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .grid-container-demo .grid-item-demo {
      margin: 0;
      background-image: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }
      .property-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #60a5fa;
      margin-bottom: 1.5rem;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 0.75rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .explanation {
      background-color: rgba(30, 58, 138, 0.5);
      background-image: none;
      color: #c7d2fe;
      padding: 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      border-left: 6px solid #4f46e5;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
      .code-snippet {
      background-color: rgba(15, 23, 42, 0.95);
      color: #e2e8f0;
      padding: 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      border: 1px solid #1e293b;
    }
    
    .code-snippet pre { 
      margin: 0;
      font-family: 'Fira Code', 'Consolas', monospace;
    }
      .control-panel {
      background-color: rgba(30, 41, 59, 0.7);
      padding: 1.75rem;
      border-radius: 1rem;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.2);
      margin-bottom: 2.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    
    .control-panel:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.3);
      background-color: rgba(30, 41, 59, 0.8);
    }
    
    .control-panel label {
      font-weight: 600;
      margin-right: 0.5rem;
      display: block;
      margin-bottom: 0.5rem;
      color: #e2e8f0;
    }
    
    /* Estilos para o sistema de acordeão */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 1rem;
      background-color: rgba(30, 41, 59, 0.9);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }
    
    .section-header:hover {
      background-color: rgba(30, 58, 138, 0.8);
    }
    
    .section-header h2 {
      margin: 0;
      color: #60a5fa;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .section-header .icon {
      transition: transform 0.3s ease;
    }
    
    .section-header .icon.expanded {
      transform: rotate(180deg);
    }
    
    .section-content {
      overflow: hidden;
      transition: max-height 0.5s ease;
      max-height: 0;
    }
    
    .section-content.expanded {
      max-height: 5000px;
    }
      .control-panel select, .control-panel input[type="number"], .control-panel input[type="text"] {
      padding: 0.65rem;
      border-radius: 0.5rem;
      border: 1px solid #475569;
      background-color: rgba(15, 23, 42, 0.8);
      color: #e2e8f0;
      margin-right: 1rem;
      margin-bottom: 0.75rem;
      min-width: 120px;
      width: 100%;
      box-sizing: border-box;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    
    .control-panel select:focus, .control-panel input[type="number"]:focus, .control-panel input[type="text"]:focus {
      border-color: #3b82f6;
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      background-color: rgba(15, 23, 42, 0.9);
    }
    
    .input-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      align-items: flex-end;
    }
    
    .input-group > div {
      flex-grow: 1;
      min-width: 150px;
    }
    
    /* Dark mode styles */
    @media (prefers-color-scheme: dark) {
      .control-panel {
        background-color: #1e293b;
        border-color: #334155;
      }
      
      .control-panel label {
        color: #e2e8f0;
      }
      
      .control-panel select, .control-panel input[type="number"], .control-panel input[type="text"] {
        background-color: #0f172a;
        border-color: #334155;
        color: #e2e8f0;
      }
      
      .explanation {
        background-color: #1e293b;
        background-image: none;
        color: #c7d2fe;
        border-left-color: #6366f1;
      }
      
      .flex-container, .grid-container-demo {
        background-color: #1e293b;
        background-image: none;
        border-color: #475569;
      }
      
      .property-title {
        color: #60a5fa;
        border-bottom-color: #3b82f6;
      }
    }  `;

  // Usar a paginação moderna ou a lista completa dependendo do modo
  const dicasParaExibir = viewMode === 'paginated' ? paginatedItems : TIPS_CONFIG;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
      <style>{style}</style>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-4 transition-colors"
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
          Guia Interativo de Flexbox e Grid
        </h1>
        <p className="text-xl text-blue-200 mt-2 max-w-2xl mx-auto">
          Explore as propriedades do Flexbox e CSS Grid e veja em tempo real
          como elas afetam o layout.
        </p>
      </motion.header>{" "}
      <div className="flex flex-col md:flex-row">        {/* Menu de navegação lateral */}
        <NavigationSidebar 
          activeSection={activeSection}
          onSectionChange={scrollToSection}
          navigationItems={TIPS_CONFIG.map(tip => ({
            id: tip.id,
            title: tip.title,
            category: tip.category,
            emoji: tip.emoji,
            difficulty: tip.difficulty,
            tags: tip.tags
          }))}
        />{" "}
        {/* Conteúdo principal */}
        <div className="content-area">
          {/* Divisão entre Flexbox e Grid */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
                <span className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                  🔄
                </span>
                Flexbox
              </h2>
              <p className="text-blue-200">
                Ideal para layouts unidimensionais (linhas OU colunas). Perfeito
                para distribuir espaço entre itens em uma linha ou coluna.
              </p>
            </div>
            <div className="flex-1 bg-indigo-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center">
                <span className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                  📊
                </span>
                Grid
              </h2>
              <p className="text-blue-200">
                Ideal para layouts bidimensionais (linhas E colunas). Perfeito
                para layouts complexos como sites completos e aplicativos.
              </p>
            </div>
          </div>{" "}          {/* Controles da página */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">            <div className="flex items-center gap-4">
              <label className="text-blue-200 font-medium">Modo de visualização:</label>
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as 'all' | 'paginated')}
                className="px-3 py-2 rounded bg-blue-800/50 text-white border border-blue-600"
              >
                <option value="all">Exibir todas</option>
                <option value="paginated">Paginado</option>
              </select>
              
              {viewMode === 'paginated' && (
                <>
                  <label className="text-blue-200 font-medium">Itens por página:</label>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-2 rounded bg-blue-800/50 text-white border border-blue-600"
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                </>
              )}
            </div>
              {viewMode === 'paginated' && (
              <PaginationControls 
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                totalItems={TIPS_CONFIG.length}
              />
            )}
          </div>

          {/* Exibição das dicas */}
          <div className="space-y-6">            {dicasParaExibir.map((tipConfig) => {
              const ComponentToRender = tipConfig.component;
              const props = getComponentProps(tipConfig.id);
              
              return (
                <LazyLoadWrapper key={tipConfig.id} id={tipConfig.id} className="mb-6">
                  <div className="scroll-mt-4">
                    <Suspense fallback={
                      <div className="animate-pulse bg-blue-800/20 rounded-lg h-40 flex items-center justify-center">
                        <span className="text-blue-300">Carregando {tipConfig.title}...</span>
                      </div>
                    }>
                      <ComponentToRender {...props} />
                    </Suspense>
                  </div>
                </LazyLoadWrapper>
              );
            })}</div>

          {/* Paginação adicional no rodapé se necessário */}          {viewMode === 'paginated' && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <PaginationControls 
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                totalItems={TIPS_CONFIG.length}
              />
            </div>
          )}

          <footer className="text-center mt-12 py-8 border-t border-blue-800/30">
            <p className="text-blue-200">
              Continue explorando e praticando para dominar o Flexbox e o Grid!
            </p>
            <p className="text-sm text-blue-300 mt-2">
              Criado para fins de aprendizado.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 mt-6"
            >
              ← Voltar ao Dashboard
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
