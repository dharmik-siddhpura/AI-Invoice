"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InvoiceActions({
  invoiceId,
  currentStatus,
}: {
  invoiceId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = async (status: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update status");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async () => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete invoice");
        setLoading(false);
        return;
      }
      router.push("/invoices");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {currentStatus !== "PAID" && (
          <button
            onClick={() => updateStatus("PAID")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Mark as Paid
          </button>
        )}
        {currentStatus === "DRAFT" && (
          <button
            onClick={() => updateStatus("SENT")}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Mark as Sent
          </button>
        )}
        <button
          onClick={deleteInvoice}
          disabled={loading}
          className="border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Delete"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-red-600 text-xs bg-red-50 border border-red-100 rounded px-3 py-1">
          {error}
        </p>
      )}
    </div>
  );
}
