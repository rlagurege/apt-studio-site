"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type RequestDetailModalProps = {
  isOpen: boolean;
  requestId: string | null;
  onClose: () => void;
  onSchedule: (requestId: string) => void;
  onStatusChange: (requestId: string, newStatus: string) => void;
};

export default function RequestDetailModal({
  isOpen,
  requestId,
  onClose,
  onSchedule,
  onStatusChange,
}: RequestDetailModalProps) {
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && requestId) {
      loadRequestDetails();
    }
  }, [isOpen, requestId]);

  const loadRequestDetails = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      const data = await res.json();
      setRequest(data.request);
      setFiles(data.files || []);
      setEvents(data.events || []);
    } catch (error) {
      console.error("Failed to load request details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !requestId) return null;

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, "")}`;
  };

  const handleText = (phone: string) => {
    const message = encodeURIComponent(`Hi, this is Tami from APT Studio regarding your appointment request.`);
    window.location.href = `sms:${phone.replace(/\D/g, "")}?body=${message}`;
  };

  const isPhone = (contact: string) => /[\d-()]/.test(contact);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-2"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading...</div>
        ) : request ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                    {request.customer?.name || request.guestName || "Unknown"}
                  </h2>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {request.customer?.email || request.guestEmail || ""}
                    {request.customer?.phone || request.guestPhone ? (
                      <> · {request.customer?.phone || request.guestPhone}</>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={request.status}
                    onChange={(e) => {
                      onStatusChange(request.id, e.target.value);
                      setRequest({ ...request, status: e.target.value });
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="requested">Requested</option>
                    <option value="contacting">Contacting</option>
                    <option value="needs_photos">Needs Photos</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              {(request.customer?.phone || request.guestPhone) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCall(request.customer?.phone || request.guestPhone)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Call
                  </button>
                  <button
                    onClick={() => handleText(request.customer?.phone || request.guestPhone)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    Text
                  </button>
                  <button
                    onClick={() => {
                      onSchedule(request.id);
                      onClose();
                    }}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Schedule
                  </button>
                </div>
              )}
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Request Details</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-[var(--muted)]">Artist</dt>
                    <dd className="text-[var(--foreground)]">
                      {request.preferredArtist?.name || "Not specified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Category</dt>
                    <dd className="text-[var(--foreground)]">{request.category || "Custom"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Placement</dt>
                    <dd className="text-[var(--foreground)]">{request.placement || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Size Notes</dt>
                    <dd className="text-[var(--foreground)]">{request.sizeNotes || "Not specified"}</dd>
                  </div>
                  {request.budgetMinCents && (
                    <div>
                      <dt className="text-[var(--muted)]">Budget</dt>
                      <dd className="text-[var(--foreground)]">
                        ${(request.budgetMinCents / 100).toFixed(0)}
                        {request.budgetMaxCents ? ` - $${(request.budgetMaxCents / 100).toFixed(0)}` : "+"}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-[var(--muted)]">Priority</dt>
                    <dd className="text-[var(--foreground)] capitalize">{request.priority || "normal"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Source</dt>
                    <dd className="text-[var(--foreground)] capitalize">{request.source || "website"}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Description</h3>
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                  {request.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Reference Images */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Reference Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface)]"
                    >
                      {file.url ? (
                        <Image
                          src={file.url}
                          alt="Reference image"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[var(--muted)] text-xs">
                          Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            {events.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Activity Timeline</h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <div className="shrink-0 w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5" />
                      <div className="flex-1">
                        <p className="text-[var(--foreground)] capitalize">
                          {event.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Notes */}
            {request.internalNotes && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Internal Notes</h3>
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                  {request.internalNotes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-[var(--muted)]">Request not found</div>
        )}
      </div>
    </div>
  );
}
