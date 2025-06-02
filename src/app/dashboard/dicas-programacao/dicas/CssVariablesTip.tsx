import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
}

export default function CssVariablesTip({ expanded, toggle }: Props) {
  return (
    <section
      id="css-variables"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-green-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-green-600 w-8 h-8 rounded-lg flex items-center justify-center">
            🎨
          </span>
          Variáveis CSS (Custom Properties)
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            O que são Variáveis CSS?
          </h3>
          <p className="explanation">
            Variáveis CSS (ou Custom Properties) permitem armazenar valores
            específicos para reutilizá-los em todo o documento, facilitando a
            manutenção e coerência do estilo.
          </p>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`:root {\n  /* Definição de variáveis no escopo raiz */\n  --primary-color: #3b82f6;\n  --secondary-color: #60a5fa;\n  --text-color: #e2e8f0;\n  --spacing-unit: 1rem;\n  --border-radius: 0.375rem;\n}\n\n.button {\n  /* Uso das variáveis */\n  background-color: var(--primary-color);\n  color: var(--text-color);\n  padding: var(--spacing-unit);\n  border-radius: var(--border-radius);\n}`}</code>
            </pre>
          </div>
          <h4 className="font-semibold text-green-300 mt-6 mb-2">
            Vantagens das Variáveis CSS
          </h4>
          <ul className="mt-4 space-y-2 text-blue-200">
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>
                Facilita alterações em todo o site mudando apenas um valor
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>Cria temas e modos escuros/claros com facilidade</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>Melhora a legibilidade e manutenção do código</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">•</span>
              <span>Pode ser modificado via JavaScript dinamicamente</span>
            </li>
          </ul>
        </div>
        <div className="control-panel mt-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Escopo e Fallbacks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-green-300 mb-2">Escopo local</h4>
              <div className="code-snippet">
                <pre>
                  <code className="text-xs">{`.container {\n  --container-padding: 2rem;\n}\n\n.container {\n  padding: var(--container-padding);\n}`}</code>
                </pre>
              </div>
              <p className="text-blue-200 mt-2 text-xs">
                Variáveis definidas em um seletor têm escopo apenas dentro desse
                seletor e seus descendentes.
              </p>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg">
              <h4 className="font-bold text-green-300 mb-2">
                Valores de fallback
              </h4>
              <div className="code-snippet">
                <pre>
                  <code className="text-xs">{`color: var(--not-defined, #fff);`}</code>
                </pre>
              </div>
              <p className="text-blue-200 mt-2 text-xs">
                Sempre forneça um valor de fallback para garantir que seu CSS
                funcione mesmo se a variável não estiver definida.
              </p>
            </div>
          </div>
          <div className="explanation mt-6">
            <h4 className="font-semibold text-green-300 mb-2">
              Manipulação com JavaScript:
            </h4>
            <div className="code-snippet">
              <pre>
                <code className="language-javascript">{`// Definir uma variável CSS via JavaScript\ndocument.documentElement.style.setProperty('--primary-color', '#4ade80');\n\n// Obter o valor de uma variável CSS\nconst primaryColor = getComputedStyle(document.documentElement)\n  .getPropertyValue('--primary-color');\nconsole.log(primaryColor); // Retorna o valor da variável`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
