import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
}

export default function AnimationsTip({ expanded, toggle }: Props) {
  return (
    <section
      id="animations"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-green-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-green-600 w-8 h-8 rounded-lg flex items-center justify-center">
            ✨
          </span>
          Animações e Transições CSS
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Transições CSS
          </h3>
          <p className="explanation">
            Transições CSS permitem que mudanças nos valores das propriedades
            ocorram suavemente durante um período especificado, em vez de
            acontecerem instantaneamente.
          </p>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.button {\n  background-color: #3b82f6;\n  color: white;\n  padding: 0.5rem 1rem;\n  border-radius: 0.25rem;\n  /* Propriedade, duração, função de tempo, atraso */\n  transition: background-color 0.3s ease-in-out, transform 0.2s ease;\n}\n\n.button:hover {\n  background-color: #1d4ed8;\n  transform: translateY(-2px);\n}`}</code>
            </pre>
          </div>
          <div className="mt-6">
            <h4 className="font-semibold text-green-300 mb-3">
              Propriedades de Transição
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  transition-property
                </h5>
                <p className="text-blue-200 text-sm">
                  Especifica as propriedades CSS a serem animadas.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`transition-property: background-color, transform;`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  transition-duration
                </h5>
                <p className="text-blue-200 text-sm">
                  Define o tempo que a transição leva para completar.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`transition-duration: 0.3s;`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  transition-timing-function
                </h5>
                <p className="text-blue-200 text-sm">
                  Controla a curva de aceleração da transição.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`transition-timing-function: ease-in-out;`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  transition-delay
                </h5>
                <p className="text-blue-200 text-sm">
                  Define o atraso antes do início da transição.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`transition-delay: 0.1s;`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="control-panel mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Animações CSS
          </h3>
          <p className="explanation">
            Animações CSS permitem criar sequências de animação mais complexas
            que podem ser repetidas, pausadas e controladas com mais precisão.
          </p>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`@keyframes bounce {\n  0%, 100% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n}\n\n.bounce {\n  animation: bounce 1s infinite;\n}`}</code>
            </pre>
          </div>
          <div className="mt-6">
            <h4 className="font-semibold text-green-300 mb-3">
              Propriedades de Animação
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  animation-name
                </h5>
                <p className="text-blue-200 text-sm">
                  Nome da animação definida com <code>@keyframes</code>.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`animation-name: bounce;`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  animation-duration
                </h5>
                <p className="text-blue-200 text-sm">Duração da animação.</p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`animation-duration: 1s;`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  animation-iteration-count
                </h5>
                <p className="text-blue-200 text-sm">
                  Número de vezes que a animação será executada.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`animation-iteration-count: infinite;`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg">
                <h5 className="font-bold text-green-300 mb-2">
                  animation-timing-function
                </h5>
                <p className="text-blue-200 text-sm">
                  Curva de aceleração da animação.
                </p>
                <div className="code-snippet mt-2">
                  <pre>
                    <code className="text-xs">{`animation-timing-function: ease-in-out;`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="explanation mt-6">
          <h4 className="font-semibold text-green-300 mb-2">
            Dicas de Performance:
          </h4>
          <ul className="space-y-2 text-blue-200">
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>
                Prefira animar <code>transform</code> e <code>opacity</code>{" "}
                para melhor performance
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>
                Evite animar propriedades que forçam repaint/reflow, como{" "}
                <code>width</code>, <code>height</code>, <code>top</code>,{" "}
                <code>left</code>
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>
                Use <code>will-change</code> para avisar o navegador sobre
                animações frequentes
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
