"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Client = { id: string; name: string; email: string };
type Item = { description: string; quantity: number; rate: number };

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsError, setClientsError] = useState("");
  const [selectedClient, setSelectedClient] = useState(preselectedClient);
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: 1, rate: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load clients");
        return r.json();
      })
      .then((data: Client[]) => {
        setClients(data);
        if (preselectedClient && data.some((c) => c.id === preselectedClient)) {
          setSelectedClient(preselectedClient);
        }
      })
      .catch(() => setClientsError("Could not load clients. Please refresh."));

    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split("T")[0]);
  }, [preselectedClient]);

  const total = items.reduce((s, i) => s + i.quantity * i.rate, 0);

  const generateWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "AI generation failed. Please try again.");
        return;
      }
      if (data.items?.length) setItems(data.items);
      if (data.notes) setNotes(data.notes);
    } catch {
      setAiError("Network error. Check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof Item, value: string | number) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const save = async (status: string) => {
    setSaveError("");
    if (!selectedClient) { setSaveError("Please select a client."); return; }
    if (!dueDate) { setSaveError("Please set a due date."); return; }
    if (items.some((i) => !i.description.trim())) {
      setSaveError("All items must have a description.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient, items, dueDate, notes, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save invoice.");
        return;
      }
      router.push(`/invoices/${data.id}`);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-500 text-sm mt-1">Use AI to auto-fill invoice items instantly</p>
        </div>

        {/* AI Generator */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
            ⚡ AI Invoice Generator
          </h2>
          <p className="text-indigo-600 text-sm mb-3">
            Describe what you did and AI will create the line items
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='e.g. "Built a REST API with auth, 20 hours at $50/hr"'
              className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && !aiLoading && generateWithAI()}
              aria-label="Describe your work for AI invoice generation"
            />
            <button
              onClick={generateWithAI}
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              {aiLoading ? "Generating..." : "Generate ⚡"}
            </button>
          </div>
          {aiError && (
            <p role="alert" className="text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {aiError}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-2">
              Client
            </label>
            {clientsError ? (
              <p className="text-red-500 text-sm">{clientsError}</p>
            ) : (
              <select
                id="client-select"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={saving}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {clients.length === 0 && !clientsError && (
              <p className="text-xs text-orange-500 mt-1">
                No clients.{" "}
                <a href="/clients/new" className="underline font-medium">Add one first</a>
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Line Items</h2>
            <button
              onClick={addItem}
              disabled={saving}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              + Add Item
            </button>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs text-gray-400 uppercase tracking-wide px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Rate ($)</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1" />
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center">
                <input
                  className="col-span-6 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  placeholder="Service or product description"
                  value={item.description}
                  disabled={saving}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  aria-label={`Item ${i + 1} description`}
                />
                <input
                  className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={item.quantity}
                  disabled={saving}
                  onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                  aria-label={`Item ${i + 1} quantity`}
                />
                <input
                  className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  disabled={saving}
                  onChange={(e) => updateItem(i, "rate", parseFloat(e.target.value) || 0)}
                  aria-label={`Item ${i + 1} rate`}
                />
                <div className="col-span-1 text-sm font-medium text-gray-700">
                  ${(item.quantity * item.rate).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(i)}
                  disabled={saving || items.length === 1}
                  className="col-span-1 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none disabled:opacity-30"
                  aria-label={`Remove item ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={saving}
            rows={3}
            placeholder="Payment terms, thank you note, or any other details..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>

        {saveError && (
          <p role="alert" className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {saveError}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => save("DRAFT")}
            disabled={saving}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => save("SENT")}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create & Send"}
          </button>
        </div>
      </main>
    </div>
  );
}
