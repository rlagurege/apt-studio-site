"use client";

import { useState } from "react";

type ArtistColorPickerProps = {
  artistSlug: string;
  currentColor: string | null;
  onColorChange: (color: string | null) => void;
};

// Predefined color palette - modern, vibrant colors
const colorPalette = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

export default function ArtistColorPicker({ artistSlug, currentColor, onColorChange }: ArtistColorPickerProps) {
  const [saving, setSaving] = useState(false);
  const [customColor, setCustomColor] = useState("");

  const handleColorSelect = async (color: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/artist/color", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: artistSlug, color }),
      });

      if (res.ok) {
        onColorChange(color);
      } else {
        console.error("Failed to save color");
      }
    } catch (error) {
      console.error("Error saving color:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomColor = () => {
    if (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) {
      handleColorSelect(customColor);
    }
  };

  return (
    <div className="space-y-4">
      {/* Color Grid */}
      <div className="grid grid-cols-8 gap-3">
        {colorPalette.map((color) => (
          <button
            key={color}
            onClick={() => handleColorSelect(color)}
            disabled={saving}
            className={`w-12 h-12 rounded-xl transition-all hover:scale-110 hover:shadow-lg ${
              currentColor === color
                ? "ring-4 ring-offset-2 ring-[var(--accent)] scale-110 shadow-lg"
                : "hover:ring-2 hover:ring-offset-1 hover:ring-[var(--border)]"
            }`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Select color ${color}`}
          >
            {currentColor === color && (
              <svg
                className="w-6 h-6 mx-auto text-white drop-shadow-md"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
        <label className="text-sm font-medium text-[var(--foreground)]">Custom Color:</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={currentColor || "#6366f1"}
            onChange={(e) => {
              setCustomColor(e.target.value);
              handleColorSelect(e.target.value);
            }}
            className="w-12 h-12 rounded-lg border-2 border-[var(--border)] cursor-pointer"
          />
          <input
            type="text"
            value={customColor || currentColor || ""}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#6366f1"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-sm font-mono focus:border-[var(--accent)] focus:outline-none"
            pattern="^#[0-9A-F]{6}$"
          />
          <button
            onClick={handleCustomColor}
            disabled={saving || !customColor}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving..." : "Apply"}
          </button>
        </div>
      </div>

      {currentColor && (
        <div className="pt-2">
          <p className="text-xs text-[var(--muted)]">
            Your appointments will be displayed with this color on the calendar, making it easy to identify which appointments are yours.
          </p>
        </div>
      )}
    </div>
  );
}
