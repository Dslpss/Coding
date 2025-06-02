import React, { useState } from "react";
import TemplateSelector from "../components/TemplateSelector";
import AdvancedControls from "../components/AdvancedControls";
import { FLEXBOX_TEMPLATES, Template } from "../config/templatesConfig";

interface Props {
  expanded: boolean;
  toggle: () => void;
  itemVariants?: any;
  flexDirectionRef?: React.RefObject<HTMLDivElement | null>;
  justifyContentRef?: React.RefObject<HTMLDivElement | null>;
  alignItemsRef?: React.RefObject<HTMLDivElement | null>;
  flexWrapRef?: React.RefObject<HTMLDivElement | null>;
  flexDirectionValue: string;
  justifyContentValue: string;
  alignItemsValue: string;
  flexWrapValue: string;
  handleFlexDirection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleJustifyContent: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAlignItems: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFlexWrap: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function FlexboxContainerTip({
  expanded,
  toggle,
  flexDirectionRef,
  justifyContentRef,
  alignItemsRef,
  flexWrapRef,
  flexDirectionValue,
  justifyContentValue,
  alignItemsValue,
  flexWrapValue,
  handleFlexDirection,
  handleJustifyContent,
  handleAlignItems,
  handleFlexWrap,
}: Props) {
  // Estados para controles avançados
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [advancedProperties, setAdvancedProperties] = useState({
    flexDirection: flexDirectionValue,
    justifyContent: justifyContentValue,
    alignItems: alignItemsValue,
    flexWrap: flexWrapValue,
    gap: "10px",
    padding: "20px",
    backgroundColor: "#1e40af",
    borderRadius: "8px",
  });

  // Função para aplicar template
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template.id);
    setIsCustomMode(false);

    // Aplicar propriedades do template
    const props = template.properties;
    if (props.flexDirection) {
      handleFlexDirection({ target: { value: props.flexDirection } } as any);
      setAdvancedProperties((prev) => ({
        ...prev,
        flexDirection: props.flexDirection,
      }));
    }
    if (props.justifyContent) {
      handleJustifyContent({ target: { value: props.justifyContent } } as any);
      setAdvancedProperties((prev) => ({
        ...prev,
        justifyContent: props.justifyContent,
      }));
    }
    if (props.alignItems) {
      handleAlignItems({ target: { value: props.alignItems } } as any);
      setAdvancedProperties((prev) => ({
        ...prev,
        alignItems: props.alignItems,
      }));
    }
    if (props.flexWrap) {
      handleFlexWrap({ target: { value: props.flexWrap } } as any);
      setAdvancedProperties((prev) => ({ ...prev, flexWrap: props.flexWrap }));
    }
  };

  // Função para entrar no modo custom
  const handleCustomMode = () => {
    setIsCustomMode(true);
    setSelectedTemplate(null);
  };

  // Função para atualizar propriedades avançadas
  const handleAdvancedPropertyChange = (property: string, value: any) => {
    setAdvancedProperties((prev) => ({ ...prev, [property]: value }));

    // Sincronizar com handlers existentes
    switch (property) {
      case "flexDirection":
        handleFlexDirection({ target: { value } } as any);
        break;
      case "justifyContent":
        handleJustifyContent({ target: { value } } as any);
        break;
      case "alignItems":
        handleAlignItems({ target: { value } } as any);
        break;
      case "flexWrap":
        handleFlexWrap({ target: { value } } as any);
        break;
    }
  };

  // Função para resetar
  const handleReset = () => {
    const defaultProps = {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "stretch",
      flexWrap: "nowrap",
      gap: "10px",
      padding: "20px",
      backgroundColor: "#1e40af",
      borderRadius: "8px",
    };

    setAdvancedProperties(defaultProps);
    handleFlexDirection({ target: { value: "row" } } as any);
    handleJustifyContent({ target: { value: "flex-start" } } as any);
    handleAlignItems({ target: { value: "stretch" } } as any);
    handleFlexWrap({ target: { value: "nowrap" } } as any);
    setSelectedTemplate(null);
  };

  // Função para valores aleatórios
  const handleRandomize = () => {
    const flexDirections = ["row", "row-reverse", "column", "column-reverse"];
    const justifyContents = [
      "flex-start",
      "flex-end",
      "center",
      "space-between",
      "space-around",
      "space-evenly",
    ];
    const alignItemsOptions = [
      "stretch",
      "flex-start",
      "flex-end",
      "center",
      "baseline",
    ];
    const flexWraps = ["nowrap", "wrap", "wrap-reverse"];

    const randomProps = {
      flexDirection:
        flexDirections[Math.floor(Math.random() * flexDirections.length)],
      justifyContent:
        justifyContents[Math.floor(Math.random() * justifyContents.length)],
      alignItems:
        alignItemsOptions[Math.floor(Math.random() * alignItemsOptions.length)],
      flexWrap: flexWraps[Math.floor(Math.random() * flexWraps.length)],
      gap: `${Math.floor(Math.random() * 30)}px`,
      padding: `${Math.floor(Math.random() * 40) + 10}px`,
      backgroundColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      borderRadius: `${Math.floor(Math.random() * 25)}px`,
    };

    setAdvancedProperties(randomProps);
    handleFlexDirection({
      target: { value: randomProps.flexDirection },
    } as any);
    handleJustifyContent({
      target: { value: randomProps.justifyContent },
    } as any);
    handleAlignItems({ target: { value: randomProps.alignItems } } as any);
    handleFlexWrap({ target: { value: randomProps.flexWrap } } as any);
  };

  // Função para exportar CSS
  const handleExportCSS = () => {
    const css = `.flex-container {
  display: flex;
  flex-direction: ${advancedProperties.flexDirection};
  justify-content: ${advancedProperties.justifyContent};
  align-items: ${advancedProperties.alignItems};
  flex-wrap: ${advancedProperties.flexWrap};
  gap: ${advancedProperties.gap};
  padding: ${advancedProperties.padding};
  background-color: ${advancedProperties.backgroundColor};
  border-radius: ${advancedProperties.borderRadius};
}`;

    navigator.clipboard.writeText(css).then(() => {
      alert("CSS copiado para o clipboard!");
    });
  };

  // Obter template atual
  const currentTemplate = selectedTemplate
    ? FLEXBOX_TEMPLATES.find((t) => t.id === selectedTemplate)
    : null;
  return (
    <section
      id="flexbox-container"
      className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-blue-500/20"
    >
      <div className="section-header" onClick={toggle}>
        <h2 className="property-title mb-0">
          <span className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
            🔀
          </span>
          Propriedades do Contêiner Flex (Flex Container)
        </h2>
        <span className={`icon ${expanded ? "expanded" : ""}`}>▼</span>
      </div>{" "}
      <div className={`section-content p-6 ${expanded ? "expanded" : ""}`}>
        {/* Template Selector */}
        <TemplateSelector
          templates={FLEXBOX_TEMPLATES}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          onCustomMode={handleCustomMode}
          className="mb-6"
        />

        {/* Advanced Controls */}
        <AdvancedControls
          properties={advancedProperties}
          onPropertyChange={handleAdvancedPropertyChange}
          onReset={handleReset}
          onRandomize={handleRandomize}
          onExportCSS={handleExportCSS}
          className="mb-6"
        />

        {/* Informações sobre o template atual */}
        {currentTemplate && (
          <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{currentTemplate.preview}</span>
              <div>
                <h4 className="text-white font-semibold">
                  {currentTemplate.name}
                </h4>
                <p className="text-blue-200 text-sm">
                  {currentTemplate.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentTemplate.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="control-panel">
          <h3 className="text-xl font-semibold text-blue-200 mb-3">
            <code>display: flex;</code>
          </h3>
          <p className="explanation">
            Esta é a propriedade fundamental que ativa o contexto Flexbox para
            os filhos diretos de um elemento.
          </p>
          <div
            className="flex-container flex"
            style={{
              gap: advancedProperties.gap,
              padding: advancedProperties.padding,
              backgroundColor: advancedProperties.backgroundColor,
              borderRadius: advancedProperties.borderRadius,
              flexDirection: advancedProperties.flexDirection as any,
              justifyContent: advancedProperties.justifyContent as any,
              alignItems: advancedProperties.alignItems as any,
              flexWrap: advancedProperties.flexWrap as any,
            }}
          >
            <div className="flex-item">Item 1</div>
            <div className="flex-item">Item 2</div>
            <div className="flex-item">Item 3</div>
          </div>
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  display: flex; /* Ativa o Flexbox */\n}`}</code>
            </pre>
          </div>
        </div>
        {/* flex-direction */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-blue-200 mb-3">
            <code>flex-direction</code>
          </h3>
          <p className="explanation">
            Define a direção do eixo principal. Valores: <code>row</code>,{" "}
            <code>row-reverse</code>, <code>column</code>,{" "}
            <code>column-reverse</code>.
          </p>{" "}
          <div className="input-group">
            <div>
              <label htmlFor="flexDirectionSelect">Mudar flex-direction:</label>
              <select
                id="flexDirectionSelect"
                onChange={handleFlexDirection}
                defaultValue="row"
              >
                <option value="row">row</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column">column</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </div>
          </div>
          <div ref={flexDirectionRef} className="flex-container flex flex-row">
            <div className="flex-item">Item 1</div>
            <div className="flex-item">Item 2</div>
            <div className="flex-item">Item 3</div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  flex-direction: ${flexDirectionValue}; /* ou row-reverse, column, column-reverse */\n}`}</code>
            </pre>
          </div>
        </div>

        {/* justify-content */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-blue-200 mb-3">
            <code>justify-content</code>
          </h3>
          <p className="explanation">
            Alinha os itens ao longo do eixo principal. Valores:{" "}
            <code>flex-start</code>, <code>flex-end</code>, <code>center</code>,{" "}
            <code>space-between</code>, <code>space-around</code>,{" "}
            <code>space-evenly</code>.
          </p>{" "}
          <div className="input-group">
            <div>
              <label htmlFor="justifyContentSelect">
                Mudar justify-content:
              </label>
              <select
                id="justifyContentSelect"
                onChange={handleJustifyContent}
                defaultValue="flex-start"
              >
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </div>
          </div>
          <div
            ref={justifyContentRef}
            className="flex-container flex justify-start"
          >
            <div className="flex-item">Item 1</div>
            <div className="flex-item">Item 2</div>
            <div className="flex-item">Item 3</div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  justify-content: ${justifyContentValue}; /* Alinhamento no eixo principal */\n}`}</code>
            </pre>
          </div>
        </div>

        {/* align-items */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-blue-200 mb-3">
            <code>align-items</code>
          </h3>
          <p className="explanation">
            Alinha os itens ao longo do eixo transversal. Valores:{" "}
            <code>stretch</code>, <code>flex-start</code>, <code>flex-end</code>
            , <code>center</code>, <code>baseline</code>.
          </p>{" "}
          <div className="input-group">
            <div>
              <label htmlFor="alignItemsSelect">Mudar align-items:</label>
              <select
                id="alignItemsSelect"
                onChange={handleAlignItems}
                defaultValue="stretch"
              >
                <option value="stretch">stretch</option>
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
                <option value="center">center</option>
                <option value="baseline">baseline</option>
              </select>
            </div>
          </div>
          <div
            ref={alignItemsRef}
            className="flex-container flex items-stretch"
            style={{ height: "120px" }}
          >
            <div className="flex-item">Item 1</div>
            <div className="flex-item" style={{ fontSize: "1.2em" }}>
              Item 2 (maior)
            </div>
            <div className="flex-item">Item 3</div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  align-items: ${alignItemsValue}; /* Alinhamento no eixo transversal */\n}`}</code>
            </pre>
          </div>
        </div>

        {/* flex-wrap */}
        <div className="control-panel">
          <h3 className="text-xl font-semibold text-blue-200 mb-3">
            <code>flex-wrap</code>
          </h3>
          <p className="explanation">
            Define se os itens devem quebrar para a próxima linha. Valores:{" "}
            <code>nowrap</code>, <code>wrap</code>, <code>wrap-reverse</code>.
          </p>{" "}
          <div className="input-group">
            <div>
              <label htmlFor="flexWrapSelect">Mudar flex-wrap:</label>
              <select
                id="flexWrapSelect"
                onChange={handleFlexWrap}
                defaultValue="nowrap"
              >
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </div>
          </div>
          <div
            ref={flexWrapRef}
            className="flex-container flex flex-nowrap"
            style={{ width: "300px" }}
          >
            <div className="flex-item" style={{ minWidth: "100px" }}>
              Item 1
            </div>
            <div className="flex-item" style={{ minWidth: "100px" }}>
              Item 2
            </div>
            <div className="flex-item" style={{ minWidth: "100px" }}>
              Item 3
            </div>
            <div className="flex-item" style={{ minWidth: "100px" }}>
              Item 4
            </div>
          </div>{" "}
          <div className="code-snippet mt-4">
            <pre>
              <code className="language-css">{`.container {\n  flex-wrap: ${flexWrapValue}; /* ou wrap, wrap-reverse */\n}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
