import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
}

export default function ResponsiveDesignTip({ expanded, toggle }: Props) {
  return (
    <section
      id="responsive-design"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-purple-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
            📱
          </span>
          Design Responsivo
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Princípios do Design Responsivo
          </h3>
          <p className="explanation">
            Design responsivo é uma abordagem que faz com que páginas web
            renderizem bem em uma variedade de dispositivos e tamanhos de janela
            ou tela.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2 flex items-center">
                <span className="bg-purple-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                  1
                </span>
                Layout Fluido
              </h4>
              <p className="text-blue-200 text-sm">
                Use unidades relativas como porcentagens, em, rem em vez de
                pixels fixos para elementos de layout.
              </p>
              <div className="code-snippet mt-2">
                <pre>
                  <code className="text-xs">{`.container {\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n}`}</code>
                </pre>
              </div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2 flex items-center">
                <span className="bg-purple-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                  2
                </span>
                Imagens Flexíveis
              </h4>
              <p className="text-blue-200 text-sm">
                Imagens devem se ajustar ao tamanho de seus containers para
                evitar quebra de layout.
              </p>
              <div className="code-snippet mt-2">
                <pre>
                  <code className="text-xs">{`img {\n  max-width: 100%;\n  height: auto;\n}`}</code>
                </pre>
              </div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2 flex items-center">
                <span className="bg-purple-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">
                  3
                </span>
                Mobile First
              </h4>
              <p className="text-blue-200 text-sm">
                Projete primeiro para dispositivos móveis e depois expanda para
                telas maiores com media queries.
              </p>
              <div className="code-snippet mt-2">
                <pre>
                  <code className="text-xs">{`/* Mobile first */\n.element { ... }\n\n/* Desktop */\n@media (min-width: 768px) {\n  .element { ... }\n}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
        <div className="control-panel mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Viewport Meta Tag
          </h3>
          <p className="explanation">
            A meta tag viewport é essencial para o design responsivo, pois
            informa ao navegador como ajustar dimensões e escala da página para
            o dispositivo.
          </p>
          <div className="code-snippet mt-2">
            <pre>
              <code className="language-html">{`<meta name="viewport" content="width=device-width, initial-scale=1.0">`}</code>
            </pre>
          </div>
          <ul className="mt-4 space-y-2 text-blue-200">
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">•</span>
              <span>
                <code>width=device-width</code>: Define a largura da página para
                seguir a largura da tela do dispositivo
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">•</span>
              <span>
                <code>initial-scale=1.0</code>: Define o nível de zoom inicial
                ao carregar a página
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-400">•</span>
              <span>
                <code>user-scalable=no</code>: (Opcional) Impede que o usuário
                dê zoom na página (use com cautela)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
