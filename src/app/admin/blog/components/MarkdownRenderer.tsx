"use client";
import React from "react";
import ReactPlayer from "react-player";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  // Função simples para renderizar markdown básico
  const renderMarkdown = (text: string) => {
    if (!text) return "";

    return (
      text
        // Headers
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-xl font-semibold text-white mt-6 mb-3">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-3xl font-bold text-white mt-10 mb-6">$1</h1>'
        )

        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
          // Se for um link de vídeo do YouTube, renderizar player
          if (
            url.includes("youtube.com") ||
            url.includes("youtu.be") ||
            url.includes("vimeo.com")
          ) {
            return `<div class="video-wrapper my-6"><div class="video-player" data-url="${url}"></div></div>`;
          }
          // Links normais
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-300 hover:text-blue-400 underline">${text}</a>`;
        })

        // Imagens
        .replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          '<img src="$2" alt="$1" class="w-full h-auto rounded-lg my-4 border border-white/20" />'
        )

        // Bold e Italic
        .replace(
          /\*\*([^*]+)\*\*/g,
          '<strong class="font-semibold text-white">$1</strong>'
        )
        .replace(/\*([^*]+)\*/g, '<em class="italic text-blue-100">$1</em>')

        // Quebras de linha
        .replace(/\n\n/g, '</p><p class="mb-4 text-white leading-relaxed">')
        .replace(/\n/g, "<br />")
    );
  };

  const processedContent = `<p class="mb-4 text-white leading-relaxed">${renderMarkdown(
    content
  )}</p>`;

  React.useEffect(() => {
    // Procurar por divs de vídeo e renderizar players
    const videoWrappers = document.querySelectorAll(".video-player");
    videoWrappers.forEach((wrapper) => {
      const url = wrapper.getAttribute("data-url");
      if (url && wrapper.children.length === 0) {
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.paddingBottom = "56.25%"; // 16:9 aspect ratio
        container.style.height = "0";
        container.style.overflow = "hidden";
        container.style.borderRadius = "0.5rem";

        // Usar ReactPlayer seria ideal, mas por simplicidade, vamos usar iframe
        const iframe = document.createElement("iframe");
        iframe.src = getEmbedUrl(url);
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.allowFullscreen = true;

        container.appendChild(iframe);
        wrapper.appendChild(container);
      }
    });
  }, [content]);

  const getEmbedUrl = (url: string): string => {
    // YouTube
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return url;
  };

  return (
    <div
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
