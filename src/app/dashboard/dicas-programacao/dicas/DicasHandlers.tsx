import React, { useRef, useState } from "react";

export function useDicasRefsHandlers() {
  // Estados para acompanhar os valores atuais
  const [flexDirectionValue, setFlexDirectionValue] = useState("row");
  const [justifyContentValue, setJustifyContentValue] = useState("flex-start");
  const [alignItemsValue, setAlignItemsValue] = useState("stretch");
  const [flexWrapValue, setFlexWrapValue] = useState("nowrap");
  const [gridColsValue, setGridColsValue] = useState("repeat(3, 1fr)");
  const [gridRowsValue, setGridRowsValue] = useState("auto auto");
  const [gridGapValue, setGridGapValue] = useState("1rem");
  const [gridColItemBValue, setGridColItemBValue] = useState("1 / 3");
  const [gridRowItemBValue, setGridRowItemBValue] = useState("auto");
  const [gridJustifySelfValue, setGridJustifySelfValue] = useState("stretch");
  const [gridAlignSelfValue, setGridAlignSelfValue] = useState("stretch");
  const [orderValues, setOrderValues] = useState([0, 0, 0]);
  const [growValues, setGrowValues] = useState([0, 1, 0]);
  // Variantes de animação para os componentes
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Refs para containers e itens
  const flexDirectionRef = useRef<HTMLDivElement>(null);
  const justifyContentRef = useRef<HTMLDivElement>(null);
  const alignItemsRef = useRef<HTMLDivElement>(null);
  const flexWrapRef = useRef<HTMLDivElement>(null);
  const orderRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const growRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const gridColsRef = useRef<HTMLDivElement>(null);
  const gridRowsRef = useRef<HTMLDivElement>(null);
  const gridGapRef = useRef<HTMLDivElement>(null);
  const gridPosItemBRef = useRef<HTMLDivElement>(null);
  const gridSelfItemBRef = useRef<HTMLDivElement>(null); // Funções de manipulação
  function handleFlexDirection(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setFlexDirectionValue(value);
    if (flexDirectionRef.current) {
      flexDirectionRef.current.style.flexDirection = value;
      // Atualizar as classes Tailwind dinamicamente
      flexDirectionRef.current.className = `flex-container flex flex-${value}`;

      // Animação de destaque
      flexDirectionRef.current.style.transform = "scale(1.02)";
      flexDirectionRef.current.style.borderColor = "#60a5fa";
      setTimeout(() => {
        if (flexDirectionRef.current) {
          flexDirectionRef.current.style.transform = "scale(1)";
          flexDirectionRef.current.style.borderColor =
            "rgba(59, 130, 246, 0.4)";
        }
      }, 300);
    }
  }

  function handleJustifyContent(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setJustifyContentValue(value);
    if (justifyContentRef.current) {
      justifyContentRef.current.style.justifyContent = value;
      // Mapear para classes Tailwind
      const tailwindClass =
        value === "flex-start"
          ? "justify-start"
          : value === "flex-end"
          ? "justify-end"
          : value === "space-between"
          ? "justify-between"
          : value === "space-around"
          ? "justify-around"
          : value === "space-evenly"
          ? "justify-evenly"
          : "justify-center";
      justifyContentRef.current.className = `flex-container flex ${tailwindClass}`;

      // Animação de destaque
      justifyContentRef.current.style.transform = "scale(1.02)";
      justifyContentRef.current.style.borderColor = "#60a5fa";
      setTimeout(() => {
        if (justifyContentRef.current) {
          justifyContentRef.current.style.transform = "scale(1)";
          justifyContentRef.current.style.borderColor =
            "rgba(59, 130, 246, 0.4)";
        }
      }, 300);
    }
  }

  function handleAlignItems(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setAlignItemsValue(value);
    if (alignItemsRef.current) {
      alignItemsRef.current.style.alignItems = value;
      // Mapear para classes Tailwind
      const tailwindClass =
        value === "flex-start"
          ? "items-start"
          : value === "flex-end"
          ? "items-end"
          : value === "stretch"
          ? "items-stretch"
          : value === "baseline"
          ? "items-baseline"
          : "items-center";
      alignItemsRef.current.className = `flex-container flex ${tailwindClass}`;

      // Animação de destaque
      alignItemsRef.current.style.transform = "scale(1.02)";
      alignItemsRef.current.style.borderColor = "#60a5fa";
      setTimeout(() => {
        if (alignItemsRef.current) {
          alignItemsRef.current.style.transform = "scale(1)";
          alignItemsRef.current.style.borderColor = "rgba(59, 130, 246, 0.4)";
        }
      }, 300);
    }
  }

  function handleFlexWrap(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setFlexWrapValue(value);
    if (flexWrapRef.current) {
      flexWrapRef.current.style.flexWrap = value;
      // Mapear para classes Tailwind
      const tailwindClass =
        value === "wrap"
          ? "flex-wrap"
          : value === "wrap-reverse"
          ? "flex-wrap-reverse"
          : "flex-nowrap";
      flexWrapRef.current.className = `flex-container flex ${tailwindClass}`;

      // Animação de destaque
      flexWrapRef.current.style.transform = "scale(1.02)";
      flexWrapRef.current.style.borderColor = "#60a5fa";
      setTimeout(() => {
        if (flexWrapRef.current) {
          flexWrapRef.current.style.transform = "scale(1)";
          flexWrapRef.current.style.borderColor = "rgba(59, 130, 246, 0.4)";
        }
      }, 300);
    }
  }
  function handleOrder(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    const newOrderValues = [...orderValues];
    newOrderValues[idx] = value;
    setOrderValues(newOrderValues);

    if (orderRefs[idx].current) {
      orderRefs[idx].current!.style.order = e.target.value;
      orderRefs[idx].current!.innerText = `Item ${idx + 1} (order: ${value})`;

      // Visual feedback
      orderRefs[idx].current!.style.transform = "scale(1.05)";
      orderRefs[idx].current!.style.borderColor = "#3b82f6";
      setTimeout(() => {
        if (orderRefs[idx].current) {
          orderRefs[idx].current!.style.transform = "scale(1)";
          orderRefs[idx].current!.style.borderColor = "";
        }
      }, 300);
    }
  }
  function handleGrow(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value);
    const newGrowValues = [...growValues];
    newGrowValues[idx] = value;
    setGrowValues(newGrowValues);

    if (growRefs[idx].current) {
      growRefs[idx].current!.style.flexGrow = e.target.value;
      growRefs[idx].current!.innerText = `Item ${idx + 1} (grow: ${value})`;

      // Visual feedback
      growRefs[idx].current!.style.transform = "scale(1.05)";
      growRefs[idx].current!.style.borderColor = "#3b82f6";
      setTimeout(() => {
        if (growRefs[idx].current) {
          growRefs[idx].current!.style.transform = "scale(1)";
          growRefs[idx].current!.style.borderColor = "";
        }
      }, 300);
    }
  }
  function handleGridCols(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setGridColsValue(value);
    if (gridColsRef.current) {
      gridColsRef.current.style.gridTemplateColumns = value;
      // Animação de destaque
      gridColsRef.current.style.transform = "scale(1.02)";
      gridColsRef.current.style.borderColor = "#a855f7";
      setTimeout(() => {
        if (gridColsRef.current) {
          gridColsRef.current.style.transform = "scale(1)";
          gridColsRef.current.style.borderColor = "rgba(168, 85, 247, 0.4)";
        }
      }, 300);
    }
  }

  function handleGridRows(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setGridRowsValue(value);
    if (gridRowsRef.current) {
      gridRowsRef.current.style.gridTemplateRows = value;
      // Animação de destaque
      gridRowsRef.current.style.transform = "scale(1.02)";
      gridRowsRef.current.style.borderColor = "#a855f7";
      setTimeout(() => {
        if (gridRowsRef.current) {
          gridRowsRef.current.style.transform = "scale(1)";
          gridRowsRef.current.style.borderColor = "rgba(168, 85, 247, 0.4)";
        }
      }, 300);
    }
  }

  function handleGridGap(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setGridGapValue(value);
    if (gridGapRef.current) {
      gridGapRef.current.style.gap = value;
      // Animação de destaque
      gridGapRef.current.style.transform = "scale(1.02)";
      gridGapRef.current.style.borderColor = "#a855f7";
      setTimeout(() => {
        if (gridGapRef.current) {
          gridGapRef.current.style.transform = "scale(1)";
          gridGapRef.current.style.borderColor = "rgba(168, 85, 247, 0.4)";
        }
      }, 300);
    }
  }
  function handleGridColItemB(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setGridColItemBValue(value);

    if (gridPosItemBRef.current) {
      gridPosItemBRef.current.style.gridColumn = value;
      gridPosItemBRef.current.innerText = `Item B (Col: ${value})`;

      // Visual feedback
      gridPosItemBRef.current.style.transform = "scale(1.05)";
      gridPosItemBRef.current.style.borderColor = "#f59e0b";
      setTimeout(() => {
        if (gridPosItemBRef.current) {
          gridPosItemBRef.current.style.transform = "scale(1)";
          gridPosItemBRef.current.style.borderColor = "";
        }
      }, 300);
    }
  }
  function handleGridRowItemB(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setGridRowItemBValue(value);

    if (gridPosItemBRef.current) {
      gridPosItemBRef.current.style.gridRow = value;
      gridPosItemBRef.current.innerText = `Item B (Col: ${
        gridPosItemBRef.current.style.gridColumn || gridColItemBValue
      }, Row: ${value})`;

      // Visual feedback
      gridPosItemBRef.current.style.transform = "scale(1.05)";
      gridPosItemBRef.current.style.borderColor = "#f59e0b";
      setTimeout(() => {
        if (gridPosItemBRef.current) {
          gridPosItemBRef.current.style.transform = "scale(1)";
          gridPosItemBRef.current.style.borderColor = "";
        }
      }, 300);
    }
  }
  function handleGridJustifySelf(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setGridJustifySelfValue(value);

    if (gridSelfItemBRef.current) {
      gridSelfItemBRef.current.style.justifySelf = value;
      gridSelfItemBRef.current.innerText = `Item B (JS: ${value}, AS: ${
        gridSelfItemBRef.current.style.alignSelf || gridAlignSelfValue
      })`;

      if (value === "stretch") {
        gridSelfItemBRef.current.style.width = "auto";
      } else {
        gridSelfItemBRef.current.style.width = "60%";
      }

      // Visual feedback
      gridSelfItemBRef.current.style.transform = "scale(1.05)";
      gridSelfItemBRef.current.style.borderColor = "#f59e0b";
      setTimeout(() => {
        if (gridSelfItemBRef.current) {
          gridSelfItemBRef.current.style.transform = "scale(1)";
          gridSelfItemBRef.current.style.borderColor = "";
        }
      }, 300);
    }
  }
  function handleGridAlignSelf(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setGridAlignSelfValue(value);

    if (gridSelfItemBRef.current) {
      gridSelfItemBRef.current.style.alignSelf = value;
      gridSelfItemBRef.current.innerText = `Item B (JS: ${
        gridSelfItemBRef.current.style.justifySelf || gridJustifySelfValue
      }, AS: ${value})`;

      if (value === "stretch") {
        gridSelfItemBRef.current.style.height = "auto";
      } else {
        gridSelfItemBRef.current.style.height = "60%";
      }

      // Visual feedback
      gridSelfItemBRef.current.style.transform = "scale(1.05)";
      gridSelfItemBRef.current.style.borderColor = "#f59e0b";
      setTimeout(() => {
        if (gridSelfItemBRef.current) {
          gridSelfItemBRef.current.style.transform = "scale(1)";
          gridSelfItemBRef.current.style.borderColor = "";
        }
      }, 300);
    }
  }
  return {
    itemVariants,
    flexDirectionRef,
    justifyContentRef,
    alignItemsRef,
    flexWrapRef,
    orderRefs,
    growRefs,
    gridColsRef,
    gridRowsRef,
    gridGapRef,
    gridPosItemBRef,
    gridSelfItemBRef, // Estados dos valores atuais
    flexDirectionValue,
    justifyContentValue,
    alignItemsValue,
    flexWrapValue,
    gridColsValue,
    gridRowsValue,
    gridGapValue,
    gridColItemBValue,
    gridRowItemBValue,
    gridJustifySelfValue,
    gridAlignSelfValue,
    orderValues,
    growValues,
    // Handlers
    handleFlexDirection,
    handleJustifyContent,
    handleAlignItems,
    handleFlexWrap,
    handleOrder,
    handleGrow,
    handleGridCols,
    handleGridRows,
    handleGridGap,
    handleGridColItemB,
    handleGridRowItemB,
    handleGridJustifySelf,
    handleGridAlignSelf,
  };
}
