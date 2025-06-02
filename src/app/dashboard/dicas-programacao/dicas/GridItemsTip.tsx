import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
  gridPosItemBRef: React.RefObject<HTMLDivElement | null>;
  gridSelfItemBRef: React.RefObject<HTMLDivElement | null>;
  gridColItemBValue: string;
  gridRowItemBValue: string;
  gridJustifySelfValue: string;
  gridAlignSelfValue: string;
  handleGridColItemB: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGridRowItemB: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGridJustifySelf: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGridAlignSelf: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function GridItemsTip({
  expanded,
  toggle,
  gridPosItemBRef,
  gridSelfItemBRef,
  gridColItemBValue,
  gridRowItemBValue,
  gridJustifySelfValue,
  gridAlignSelfValue,
  handleGridColItemB,
  handleGridRowItemB,
  handleGridJustifySelf,
  handleGridAlignSelf,
}: Props) {
  return (
    <section
      id="grid-items"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-indigo-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
            📐
          </span>
          Propriedades dos Itens Grid (Grid Items)
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        {/* grid-column e grid-row */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-indigo-200 mb-3">
            <code>grid-column</code> e <code>grid-row</code>
          </h3>
          <p className="explanation">
            Define em qual linha/coluna um item começa e termina. Atalhos para{" "}
            <code>grid-column-start/end</code> e <code>grid-row-start/end</code>
            .<br />
            Valores: <code>1 / 3</code> (começa na linha 1, termina antes da
            linha 3), <code>span 2</code> (ocupa 2 faixas).
          </p>
          <div className="input-group">
            <div>
              <label htmlFor="gridItem1Col">Item B - grid-column:</label>
              <input
                type="text"
                id="gridItem1Col"
                defaultValue="1 / 3"
                onChange={handleGridColItemB}
                placeholder="ex: 1 / 3 ou span 2"
              />
            </div>
            <div>
              <label htmlFor="gridItem1Row">Item B - grid-row:</label>
              <input
                type="text"
                id="gridItem1Row"
                defaultValue="auto"
                onChange={handleGridRowItemB}
                placeholder="ex: 2 ou auto"
              />
            </div>
          </div>
          <div
            className="grid-container-demo"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "auto auto",
              gap: "0.5rem",
              minHeight: 200,
            }}
          >
            <div className="grid-item-demo">Item A</div>
            <div
              ref={gridPosItemBRef}
              className="grid-item-demo"
              style={{
                gridColumn: "1 / 3",
                backgroundColor: "#f59e0b",
                color: "#000",
              }}
            >
              Item B (Col: 1 / 3)
            </div>
            <div className="grid-item-demo">Item C</div>
            <div className="grid-item-demo">Item D</div>
            <div className="grid-item-demo">Item E</div>
            <div className="grid-item-demo">Item F</div>
            <div className="grid-item-demo">Item G</div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.item-b {\n  grid-column: ${gridColItemBValue}; /* Começa/termina na linha/coluna especificada */\n  grid-row: ${gridRowItemBValue};     /* Linha atual */\n}`}</code>
            </pre>
          </div>
        </div>

        {/* justify-self e align-self */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-indigo-200 mb-3">
            <code>justify-self</code> e <code>align-self</code> (Grid)
          </h3>
          <p className="explanation">
            Alinha um item individual dentro de sua célula de grid.
            <br />
            <code>justify-self</code> alinha horizontalmente,{" "}
            <code>align-self</code> verticalmente.
            <br />
            Valores: <code>start</code>, <code>end</code>, <code>center</code>,{" "}
            <code>stretch</code> (padrão).
          </p>
          <div className="input-group">
            <div>
              <label htmlFor="gridItemJustifySelf">
                Item B - justify-self:
              </label>
              <select
                id="gridItemJustifySelf"
                onChange={handleGridJustifySelf}
                defaultValue="stretch"
              >
                <option value="stretch">stretch</option>
                <option value="start">start</option>
                <option value="end">end</option>
                <option value="center">center</option>
              </select>
            </div>
            <div>
              <label htmlFor="gridItemAlignSelf">Item B - align-self:</label>
              <select
                id="gridItemAlignSelf"
                onChange={handleGridAlignSelf}
                defaultValue="stretch"
              >
                <option value="stretch">stretch</option>
                <option value="start">start</option>
                <option value="end">end</option>
                <option value="center">center</option>
              </select>
            </div>
          </div>
          <div
            className="grid-container-demo"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "100px 100px",
              gap: "0.5rem",
            }}
          >
            <div className="grid-item-demo">Item A</div>
            <div
              ref={gridSelfItemBRef}
              className="grid-item-demo"
              style={{
                justifySelf: "stretch",
                alignSelf: "stretch",
                backgroundColor: "#f59e0b",
                color: "#000",
                width: "auto",
                height: "auto",
              }}
            >
              Item B (JS: stretch, AS: stretch)
            </div>
            <div className="grid-item-demo">Item C</div>
            <div className="grid-item-demo">Item D</div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.item-b {\n  justify-self: ${gridJustifySelfValue}; /* Alinhamento horizontal dentro da célula */\n  align-self: ${gridAlignSelfValue};   /* Alinhamento vertical dentro da célula */\n}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
