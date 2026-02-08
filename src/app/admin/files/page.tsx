"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type File = {
  id: string;
  url: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  request?: { id: string; description: string | null };
  appointment?: { id: string; title: string };
  createdAt: string;
};

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "request" | "appointment">("all");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  useEffect(() => {
    loadFiles();
  }, [filterType]);

  const loadFiles = async () => {
    try {
      const res = await fetch(`/api/files?type=${filterType}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        loadFiles();
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">File Management</h1>
        <p className="text-[var(--muted)]">View and manage uploaded files</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
        >
          <option value="all">All Files</option>
          <option value="request">Request Files</option>
          <option value="appointment">Appointment Files</option>
        </select>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
          No files found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
              onClick={() => setPreviewFile(file)}
            >
              {isImage(file.mimeType) && file.url ? (
                <div className="relative aspect-square">
                  <Image
                    src={file.url}
                    alt={file.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-[var(--surface)]">
                  <svg
                    className="w-12 h-12 text-[var(--muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-[var(--foreground)] truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-[var(--muted)]">{formatFileSize(file.sizeBytes)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute right-4 top-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {isImage(previewFile.mimeType) && previewFile.url ? (
              <Image
                src={previewFile.url}
                alt={previewFile.filename}
                width={1200}
                height={1200}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <div className="bg-[var(--card)] rounded-lg p-8 text-center">
                <p className="text-[var(--foreground)] mb-4">{previewFile.filename}</p>
                <a
                  href={previewFile.url || "#"}
                  download
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Download
                </a>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-white">
                <p className="font-medium">{previewFile.filename}</p>
                <p className="text-sm text-gray-300">{formatFileSize(previewFile.sizeBytes)}</p>
              </div>
              <button
                onClick={() => handleDelete(previewFile.id)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
