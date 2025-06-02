import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
  gridColsRef: React.RefObject<HTMLDivElement | null>;
  gridRowsRef: React.RefObject<HTMLDivElement | null>;
  gridGapRef: React.RefObject<HTMLDivElement | null>;
  gridColsValue: string;
  gridRowsValue: string;
  gridGapValue: string;
  handleGridCols: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGridRows: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGridGap: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GridContainerTip({
  expanded,
  toggle,
  gridColsRef,
  gridRowsRef,
  gridGapRef,
  gridColsValue,
  gridRowsValue,
  gridGapValue,
  handleGridCols,
  handleGridRows,
  handleGridGap,
}: Props) {
  return (
    <section
      id="grid-container"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
            📊
          </span>
          Propriedades do Contêiner Grid (Grid Container)
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        {/* display: grid */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            <code>display: grid;</code>
          </h3>
          <p className="explanation">
            Ativa o contexto Grid para os filhos diretos de um elemento.
          </p>
          <div
            className="grid-container-demo"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            <div className="grid-item-demo">Item A</div>
            <div className="grid-item-demo">Item B</div>
            <div className="grid-item-demo">Item C</div>
            <div className="grid-item-demo">Item D</div>
            <div className="grid-item-demo">Item E</div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  display: grid; /* Ativa o Grid Layout */\n  grid-template-columns: ${gridColsValue}; /* Colunas atuais */\n  grid-template-rows: ${gridRowsValue}; /* Linhas atuais */\n  gap: ${gridGapValue}; /* Espaçamento atual */\n}`}</code>
            </pre>
          </div>
        </div>
        {/* grid-template-columns */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            <code>grid-template-columns</code>
          </h3>
          <p className="explanation">
            Define as colunas do grid. Use unidades como <code>px</code>,{" "}
            <code>%</code>, <code>fr</code> (fração do espaço disponível), ou
            funções como <code>repeat()</code>.<br />
            Exemplos: <code>100px 1fr 2fr</code>, <code>repeat(3, 1fr)</code>,{" "}
            <code>auto 1fr auto</code>.
          </p>
          <div className="input-group">
            <div>
              <label htmlFor="gridColsInput">
                Mudar grid-template-columns:
              </label>
              <input
                type="text"
                id="gridColsInput"
                defaultValue="repeat(3, 1fr)"
                onChange={handleGridCols}
              />
            </div>
          </div>
          <div
            ref={gridColsRef}
            className="grid-container-demo"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            <div className="grid-item-demo">Col 1</div>
            <div className="grid-item-demo">Col 2</div>
            <div className="grid-item-demo">Col 3</div>
            <div className="grid-item-demo">Col 4</div>
            <div className="grid-item-demo">Col 5</div>{" "}
            <div className="grid-item-demo">Col 6</div>
          </div>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  display: grid;\n  grid-template-columns: ${gridColsValue}; /* Colunas definidas */\n}`}</code>
            </pre>
          </div>
        </div>
        {/* grid-template-rows */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            <code>grid-template-rows</code>
          </h3>
          <p className="explanation">
            Define as linhas do grid. Similar ao{" "}
            <code>grid-template-columns</code>.<br />
            Exemplos: <code>100px auto</code>,{" "}
            <code>repeat(2, minmax(100px, auto))</code>.
          </p>
          <div className="input-group">
            <div>
              <label htmlFor="gridRowsInput">Mudar grid-template-rows:</label>
              <input
                type="text"
                id="gridRowsInput"
                defaultValue="auto auto"
                onChange={handleGridRows}
              />
            </div>
          </div>
          <div
            ref={gridRowsRef}
            className="grid-container-demo"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "auto auto",
              gap: "1rem",
            }}
          >
            <div className="grid-item-demo">Item R1C1</div>
            <div className="grid-item-demo">Item R1C2</div>
            <div className="grid-item-demo">Item R1C3</div>
            <div className="grid-item-demo">Item R2C1</div>
            <div className="grid-item-demo">Item R2C2</div>{" "}
            <div className="grid-item-demo">Item R2C3</div>
          </div>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: ${gridRowsValue}; /* Linhas definidas */\n}`}</code>
            </pre>
          </div>
        </div>
        {/* gap */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            <code>gap</code> (<code>row-gap</code>, <code>column-gap</code>)
          </h3>
          <p className="explanation">
            Define o espaçamento entre as linhas e colunas do grid.{" "}
            <code>gap</code> é um atalho para <code>row-gap</code> e{" "}
            <code>column-gap</code>.<br />
            Exemplos: <code>1rem</code>, <code>10px 20px</code> (row-gap
            column-gap).
          </p>
          <div className="input-group">
            <div>
              <label htmlFor="gridGapInput">Mudar gap:</label>
              <input
                type="text"
                id="gridGapInput"
                defaultValue="1rem"
                onChange={handleGridGap}
              />
            </div>
          </div>
          <div
            ref={gridGapRef}
            className="grid-container-demo"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            <div className="grid-item-demo">Item 1</div>
            <div className="grid-item-demo">Item 2</div>
            <div className="grid-item-demo">Item 3</div>
            <div className="grid-item-demo">Item 4</div>{" "}
            <div className="grid-item-demo">Item 5</div>
          </div>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: ${gridGapValue}; /* Espaçamento definido */\n}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
