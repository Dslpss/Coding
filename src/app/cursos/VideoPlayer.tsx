"use client";
// Reprodutor de vídeo usando react-player
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
export default function VideoPlayer({ url }: { url: string }) {
  return (
    <div className="aspect-video w-full my-4">
      <ReactPlayer url={url} width="100%" height="100%" controls />
    </div>
  );
}
