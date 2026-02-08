/**
 * Security utilities for input validation, sanitization, and file handling
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers like onclick=
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  // Check if it's 10-15 digits
  return /^\d{10,15}$/.test(cleaned);
}

/**
 * Validate file extension against allowed types
 */
export function isValidImageExtension(filename: string): boolean {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return allowedExtensions.includes(ext);
}

/**
 * Validate MIME type
 */
export function isValidImageMimeType(mimeType: string | null): boolean {
  if (!mimeType) return false;
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSizeMB: number = 8): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxSizeBytes;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") return "file";
  
  // Remove path traversal attempts
  let sanitized = filename
    .replace(/\.\./g, "") // Remove ..
    .replace(/\//g, "_") // Replace / with _
    .replace(/\\/g, "_") // Replace \ with _
    .trim();
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, "");
  
  // Ensure it's not empty
  if (!sanitized) sanitized = "file";
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf("."));
    sanitized = sanitized.substring(0, 250) + ext;
  }
  
  return sanitized;
}

/**
 * Validate slug format (for artist slugs, etc.)
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  return /^[a-z0-9-]+$/.test(slug) && slug.length <= 50;
}

/**
 * Validate and sanitize text input (for descriptions, notes, etc.)
 */
export function validateTextInput(input: string, maxLength: number = 5000): string | null {
  if (!input || typeof input !== "string") return null;
  
  const sanitized = sanitizeInput(input);
  
  if (sanitized.length === 0) return null;
  if (sanitized.length > maxLength) return null;
  
  return sanitized;
}

/**
 * Check if string contains potentially dangerous content
 */
export function containsDangerousContent(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limit key generator for consistent rate limiting
 */
export function getRateLimitKey(identifier: string, endpoint: string): string {
  return `rate_limit:${endpoint}:${identifier}`;
}
