"use client";
import { useState } from "react";
import { FaImage, FaSpinner, FaTrash, FaUpload } from "react-icons/fa";
import Image from "next/image";

interface ImageUploadProps {
  onImageChange: (url: string | null) => void;
  currentImage?: string | null;
  folder?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageChange,
  currentImage,
  folder = "courses",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações no frontend
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Tipo de arquivo não permitido. Use apenas JPEG, JPG, PNG ou WebP."
      );
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Arquivo muito grande. Tamanho máximo: 5MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Preview local
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file); // Upload para o servidor
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      let response = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      // Se falhar com Firebase Storage, tentar upload local
      if (!response.ok) {
        console.log("⚠️ Firebase Storage falhou, tentando upload local...");
        response = await fetch("/api/admin/upload-local", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro no upload");
      }

      const data = await response.json();
      onImageChange(data.url);
      console.log("✅ Upload realizado com sucesso:", data.url);
    } catch (err) {
      console.error("❌ Erro no upload:", err);
      setError(err instanceof Error ? err.message : "Erro no upload");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      // Limpar o input para permitir reupar o mesmo arquivo
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
    setError("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Imagem do curso
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative">
          {" "}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={true}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <FaSpinner className="text-white text-2xl animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
          >
            <FaTrash size={12} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              w-full h-48 border-2 border-dashed border-gray-300 rounded-lg 
              flex flex-col items-center justify-center cursor-pointer
              hover:border-blue-400 hover:bg-blue-50 transition-colors
              ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <div className="text-center">
              {uploading ? (
                <>
                  <FaSpinner className="mx-auto h-12 w-12 text-blue-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-600">Enviando imagem...</p>
                </>
              ) : (
                <>
                  <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Clique para escolher uma imagem
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WebP até 5MB
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {!preview && !uploading && (
        <div className="flex items-center justify-center">
          <label
            htmlFor="image-upload"
            className={`
              inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm 
              text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer
              transition-colors disabled:opacity-50
              ${disabled ? "cursor-not-allowed" : ""}
            `}
          >
            <FaUpload className="mr-2" />
            Escolher imagem
          </label>
        </div>
      )}
    </div>
  );
}
