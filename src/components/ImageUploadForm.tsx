"use client";

import { useState } from "react";
import { formatStyleTag } from "@/lib/utils";
import type { StyleTag } from "@/lib/types";

const styleOptions: StyleTag[] = [
  "black_and_grey",
  "color",
  "traditional",
  "neo_traditional",
  "fine_line",
  "realism",
  "anime",
  "script",
  "coverup",
  "before_after",
  "laser_removal",
  "custom",
];

export default function ImageUploadForm() {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<StyleTag[]>(["custom"]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileChange = (type: "before" | "after", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "before") {
        setBeforeFile(file);
      } else {
        setAfterFile(file);
      }
    }
  };

  const toggleStyle = (style: StyleTag) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow upload with just one photo (after) or both
    const photoToUpload = afterFile || beforeFile;
    if (!photoToUpload) {
      setMessage({ type: "error", text: "Please select at least one photo" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      if (beforeFile) formData.append("before", beforeFile);
      if (afterFile) formData.append("after", afterFile);
      formData.append("title", title || "New piece");
      formData.append("styles", selectedStyles.join(","));

      const res = await fetch("/api/artist/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Photo uploaded successfully!" });
        setBeforeFile(null);
        setAfterFile(null);
        setTitle("");
        setSelectedStyles(["custom"]);
        // Reset file inputs
        const beforeInput = document.getElementById("before-file") as HTMLInputElement;
        const afterInput = document.getElementById("after-file") as HTMLInputElement;
        if (beforeInput) beforeInput.value = "";
        if (afterInput) afterInput.value = "";
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to upload photo" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Title (optional)
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Realism Portrait, Traditional Sleeve"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Styles
        </label>
        <div className="flex flex-wrap gap-2">
          {styleOptions.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                selectedStyles.includes(style)
                  ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--border)]"
              }`}
            >
              {formatStyleTag(style)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="before-file" className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Before
          </label>
          <label
            htmlFor="before-file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer bg-[var(--surface)] hover:bg-[var(--card)] transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-[var(--muted)]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021 5.5 5.5 0 0 0 5 13h3m-3-4h3m-3 4h3m6-4v6m0 0v3m0-3h3m-3 0h-3"
                />
              </svg>
              <p className="mb-1 text-xs text-[var(--muted)]">
                <span className="font-medium">Tap to upload</span> or drag and drop
              </p>
              <p className="text-xs text-[var(--muted)]">PNG, JPG (optional)</p>
            </div>
            <input
              id="before-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("before", e)}
              className="hidden"
            />
          </label>
          {beforeFile && (
            <p className="mt-2 text-xs text-[var(--muted)] truncate">✓ {beforeFile.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="after-file" className="block text-sm font-medium text-[var(--foreground)] mb-2">
            After
          </label>
          <label
            htmlFor="after-file"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer bg-[var(--surface)] hover:bg-[var(--card)] transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-[var(--muted)]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021 5.5 5.5 0 0 0 5 13h3m-3-4h3m-3 4h3m6-4v6m0 0v3m0-3h3m-3 0h-3"
                />
              </svg>
              <p className="mb-1 text-xs text-[var(--muted)]">
                <span className="font-medium">Tap to upload</span> or drag and drop
              </p>
              <p className="text-xs text-[var(--muted)]">PNG, JPG</p>
            </div>
            <input
              id="after-file"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("after", e)}
              className="hidden"
            />
          </label>
          {afterFile && (
            <p className="mt-2 text-xs text-[var(--muted)] truncate">✓ {afterFile.name}</p>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-900/20 text-green-200 border border-green-800/50"
              : "bg-red-900/20 text-red-200 border border-red-800/50"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || (!afterFile && !beforeFile)}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity touch-manipulation"
      >
        {uploading ? "Uploading..." : "Add to Gallery"}
      </button>
    </form>
  );
}
