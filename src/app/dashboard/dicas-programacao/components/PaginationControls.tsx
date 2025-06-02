import React, { useState, useMemo } from "react";

interface PaginationControlsProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}

export default function PaginationControls({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  showPageNumbers = true,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calcular quais números de página mostrar
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Se há poucas páginas, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com reticências
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">
          Página {currentPage} de {totalPages} ({totalItems} dicas)
        </span>
      </div>

      <div className="flex items-center space-x-1">
        {/* Botão Primeira */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ⏮️
        </button>

        {/* Botão Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ◀️ Anterior
        </button>

        {/* Números das páginas */}
        {showPageNumbers && (
          <div className="flex space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white border border-blue-500"
                        : "bg-gray-800/50 border border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Botão Próximo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Próximo ▶️
        </button>

        {/* Botão Última */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ⏭️
        </button>
      </div>

      {/* Seletor de itens por página */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-400">Por página:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            const newItemsPerPage = parseInt(e.target.value);
            const newPage =
              Math.ceil(((currentPage - 1) * itemsPerPage) / newItemsPerPage) +
              1;
            onPageChange(newPage);
          }}
          className="px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>
    </div>
  );
}

// Hook para usar paginação
export function usePagination<T>(items: T[], itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll para o topo da seção de conteúdo
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}
