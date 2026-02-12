"use client";

import { useState, useRef } from "react";
import { formatStyleTag } from "@/lib/utils";
import type { StyleTag } from "@/lib/types";

const quickStyles: StyleTag[] = [
  "realism",
  "traditional",
  "color",
  "black_and_grey",
  "fine_line",
  "custom",
];

export default function ImageUploadForm() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleTag>("custom");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setMessage(null);
    }
  };

  const handleBeforeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBeforeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setMessage({ type: "error", text: "Please select a photo" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      // Use photoFile as "after" (main photo)
      formData.append("after", photoFile);
      if (beforeFile) formData.append("before", beforeFile);
      // Generate a simple title based on style
      const styleTitle = selectedStyle !== "custom" ? formatStyleTag(selectedStyle) : "New piece";
      formData.append("title", styleTitle);
      formData.append("styles", selectedStyle);

      const res = await fetch("/api/artist/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "✓ Photo added to gallery!" });
        setPhotoFile(null);
        setBeforeFile(null);
        setSelectedStyle("custom");
        setShowAdvanced(false);
        // Reset file inputs
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (beforeInputRef.current) beforeInputRef.current.value = "";
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
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
      {/* Main Photo Upload - Large, Touch-Friendly */}
      <div>
        <label
          htmlFor="photo-file"
          className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer bg-[var(--surface)] hover:bg-[var(--card)] hover:border-[var(--accent)] transition-all touch-manipulation active:scale-[0.98]"
        >
          {photoFile ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">Photo Selected</p>
              <p className="text-xs text-[var(--muted)] truncate max-w-[200px]">{photoFile.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-3 text-xs text-[var(--accent)] hover:underline"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <svg
                className="w-12 h-12 mb-3 text-[var(--muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-base font-medium text-[var(--foreground)] mb-1">
                Tap to choose from gallery
              </p>
              <p className="text-xs text-[var(--muted)]">or take a photo</p>
            </div>
          )}
          <input
            id="photo-file"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Quick Style Selection */}
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-2">Style (optional)</label>
        <div className="flex flex-wrap gap-2">
          {quickStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all touch-manipulation ${
                selectedStyle === style
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--card)]"
              }`}
            >
              {formatStyleTag(style)}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Options (Collapsible) */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <span>Before & After (optional)</span>
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showAdvanced && (
          <div className="mt-3">
            <label
              htmlFor="before-file"
              className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[var(--border)] rounded-lg cursor-pointer bg-[var(--surface)] hover:bg-[var(--card)] transition-colors touch-manipulation"
            >
              {beforeFile ? (
                <div className="text-center">
                  <p className="text-xs text-[var(--foreground)]">✓ {beforeFile.name}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBeforeFile(null);
                      if (beforeInputRef.current) beforeInputRef.current.value = "";
                    }}
                    className="mt-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto mb-1 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-xs text-[var(--muted)]">Add before photo</p>
                </div>
              )}
              <input
                id="before-file"
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleBeforeSelect}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-3 text-sm text-center ${
            message.type === "success"
              ? "bg-green-900/20 text-green-200 border border-green-800/50"
              : "bg-red-900/20 text-red-200 border border-red-800/50"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || !photoFile}
        className="w-full rounded-xl bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity touch-manipulation active:scale-[0.98] shadow-lg shadow-[var(--accent)]/20"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </span>
        ) : (
          "Add to Gallery"
        )}
      </button>
    </form>
  );
}
