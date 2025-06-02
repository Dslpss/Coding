import React from "react";

interface Props {
  expanded: boolean;
  toggle: () => void;
  orderRefs: React.RefObject<HTMLDivElement | null>[];
  growRefs: React.RefObject<HTMLDivElement | null>[];
  orderValues: number[];
  growValues: number[];
  handleOrder: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGrow: (idx: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FlexboxItemsTip({
  expanded,
  toggle,
  orderRefs,
  growRefs,
  orderValues,
  growValues,
  handleOrder,
  handleGrow,
}: Props) {
  return (
    <section
      id="flexbox-items"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
            📏
          </span>
          Propriedades dos Itens Flex (Flex Items)
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        {/* order */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            <code>order</code>
          </h3>
          <p className="explanation">
            Controla a ordem visual dos itens. Padrão: 0.
          </p>
          <div className="input-group">
            {[0, 1, 2].map((idx) => (
              <div key={idx}>
                <label htmlFor={`orderItem${idx + 1}`}>{`Item ${
                  idx + 1
                } order:`}</label>
                <input
                  type="number"
                  id={`orderItem${idx + 1}`}
                  defaultValue={0}
                  onChange={(e) => handleOrder(idx, e)}
                />
              </div>
            ))}
          </div>
          <div className="flex-container flex">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                ref={orderRefs[idx]}
                className="flex-item"
                style={{ order: 0 }}
              >
                {" "}
                {`Item ${idx + 1} (order: 0)`}
              </div>
            ))}
          </div>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.item-1 { order: ${orderValues[0]}; }\n.item-2 { order: ${orderValues[1]}; }\n.item-3 { order: ${orderValues[2]}; }`}</code>
            </pre>
          </div>
        </div>
        {/* flex-grow */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            <code>flex-grow</code>
          </h3>
          <p className="explanation">
            Define a capacidade de um item crescer. Padrão: 0.
          </p>
          <div className="input-group">
            {[0, 1, 2].map((idx) => (
              <div key={idx}>
                <label htmlFor={`growItem${idx + 1}`}>{`Item ${
                  idx + 1
                } grow:`}</label>
                <input
                  type="number"
                  id={`growItem${idx + 1}`}
                  defaultValue={idx === 1 ? 1 : 0}
                  min={0}
                  onChange={(e) => handleGrow(idx, e)}
                />
              </div>
            ))}
          </div>
          <div className="flex-container flex">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                ref={growRefs[idx]}
                className="flex-item"
                style={{ flexGrow: idx === 1 ? 1 : 0 }}
              >
                {" "}
                {`Item ${idx + 1} (grow: ${idx === 1 ? 1 : 0})`}
              </div>
            ))}
          </div>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.item-1 { flex-grow: ${growValues[0]}; }\n.item-2 { flex-grow: ${growValues[1]}; }\n.item-3 { flex-grow: ${growValues[2]}; }`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
