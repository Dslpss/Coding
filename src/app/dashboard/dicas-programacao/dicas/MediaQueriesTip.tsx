import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
}

export default function MediaQueriesTip({ expanded, toggle }: Props) {
  return (
    <section
      id="media-queries"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-purple-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
            📐
          </span>
          Media Queries
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            O que são Media Queries?
          </h3>
          <p className="explanation">
            Media queries permitem aplicar estilos CSS com base em
            características do dispositivo como largura da tela, orientação ou
            resolução.
          </p>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`/* Aplicado quando a largura da tela é no máximo 768px */\n@media (max-width: 768px) {\n  .container {\n    flex-direction: column;\n  }\n  \n  .sidebar {\n    width: 100%;\n  }\n}`}</code>
            </pre>
          </div>
          <h4 className="font-semibold text-purple-300 mt-6 mb-2">
            Breakpoints Comuns
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-600/30">
                  <th className="py-2 px-4 text-purple-300">Nome</th>
                  <th className="py-2 px-4 text-purple-300">Breakpoint</th>
                  <th className="py-2 px-4 text-purple-300">Dispositivos</th>
                </tr>
              </thead>
              <tbody className="text-blue-200">
                <tr className="border-b border-blue-600/20">
                  <td className="py-2 px-4">Extra small</td>
                  <td className="py-2 px-4">
                    <code>max-width: 575px</code>
                  </td>
                  <td className="py-2 px-4">Celulares pequenos</td>
                </tr>
                <tr className="border-b border-blue-600/20">
                  <td className="py-2 px-4">Small</td>
                  <td className="py-2 px-4">
                    <code>min-width: 576px</code>
                  </td>
                  <td className="py-2 px-4">Celulares grandes</td>
                </tr>
                <tr className="border-b border-blue-600/20">
                  <td className="py-2 px-4">Medium</td>
                  <td className="py-2 px-4">
                    <code>min-width: 768px</code>
                  </td>
                  <td className="py-2 px-4">Tablets</td>
                </tr>
                <tr className="border-b border-blue-600/20">
                  <td className="py-2 px-4">Large</td>
                  <td className="py-2 px-4">
                    <code>min-width: 992px</code>
                  </td>
                  <td className="py-2 px-4">Desktops</td>
                </tr>
                <tr className="border-b border-blue-600/20">
                  <td className="py-2 px-4">Extra large</td>
                  <td className="py-2 px-4">
                    <code>min-width: 1200px</code>
                  </td>
                  <td className="py-2 px-4">Desktops grandes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="control-panel mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Tipos de Media Queries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2">Por largura</h4>
              <div className="code-snippet">
                <pre>
                  <code className="text-xs">{`@media (min-width: 768px) { ... }\n@media (max-width: 1200px) { ... }\n@media (min-width: 768px) and (max-width: 1200px) { ... }`}</code>
                </pre>
              </div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2">Por orientação</h4>
              <div className="code-snippet">
                <pre>
                  <code className="text-xs">{`@media (orientation: portrait) { ... }\n@media (orientation: landscape) { ... }`}</code>
                </pre>
              </div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2">
                Por tipo de dispositivo
              </h4>
              <div className="code-snippet">
                <pre>
                  <code className="text-xs">{`@media screen { ... } /* Telas */\n@media print { ... } /* Impressão */`}</code>
                </pre>
              </div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2">
                Media queries combinadas
              </h4>
              <div className="code-snippet">
                <pre>
                  <code className="text-xs">{`@media screen and (min-width: 768px) and (orientation: landscape) { ... }`}</code>
                </pre>
              </div>
            </div>
          </div>
          <div className="explanation mt-6">
            <h4 className="font-semibold text-purple-300 mb-2">Dica:</h4>
            <p>
              Ao usar a abordagem "mobile-first", comece com estilos para
              dispositivos móveis como padrão, depois use <code>min-width</code>{" "}
              para adicionar estilos para telas maiores. Isso geralmente resulta
              em CSS mais limpo e eficiente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
