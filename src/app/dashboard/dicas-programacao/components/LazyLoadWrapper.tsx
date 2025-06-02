import React, { useState, useEffect, useRef } from "react";

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  id: string;
  threshold?: number;
  placeholder?: React.ReactNode;
  className?: string;
}

export default function LazyLoadWrapper({
  children,
  id,
  threshold = 0.1,
  placeholder,
  className = "",
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "50px", // Carrega 50px antes de ficar visível
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, hasLoaded]);

  const defaultPlaceholder = (
    <div className="flex items-center justify-center py-12 bg-gray-800/20 rounded-xl border border-gray-700">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando conteúdo...</p>
      </div>
    </div>
  );

  return (
    <div ref={elementRef} id={id} className={className}>
      {isVisible ? children : placeholder || defaultPlaceholder}
    </div>
  );
}

// Hook para otimizar o carregamento de componentes pesados
export function useLazyComponent<T>(
  componentLoader: () => Promise<{ default: React.ComponentType<T> }>,
  deps: any[] = []
) {
  const [Component, setComponent] = useState<React.ComponentType<T> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        const { default: LoadedComponent } = await componentLoader();

        if (isMounted) {
          setComponent(() => LoadedComponent);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to load component")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, deps);

  return { Component, loading, error };
}
