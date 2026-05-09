"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

type Business = {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; country: string; currency: string;
};

const FIELDS = [
  { field: "name", label: "Business Name", placeholder: "Your Business Name" },
  { field: "email", label: "Business Email", placeholder: "hello@yourbusiness.com", type: "email" },
  { field: "phone", label: "Phone", placeholder: "+1 234 567 890" },
  { field: "address", label: "Address", placeholder: "123 Main Street" },
  { field: "city", label: "City", placeholder: "New York" },
  { field: "country", label: "Country", placeholder: "United States" },
];

export default function SettingsPage() {
  const [form, setForm] = useState<Partial<Business>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load settings");
        return r.json();
      })
      .then(setForm)
      .catch(() => setStatus({ type: "error", message: "Failed to load settings. Please refresh." }))
      .finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Failed to save settings." });
        return;
      }
      setForm(data);
      setStatus({ type: "success", message: "Settings saved successfully!" });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse max-w-xl">
            <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-48 mb-8" />
            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-9 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Your business information shown on invoices</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm max-w-xl">
          <h2 className="font-semibold text-gray-900 mb-4">Business Details</h2>

          <fieldset disabled={saving} className="space-y-4">
            {FIELDS.map(({ field, label, placeholder, type }) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  id={field}
                  type={type ?? "text"}
                  value={form[field as keyof Business] || ""}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:opacity-60"
                />
              </div>
            ))}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                id="currency"
                value={form.currency || "USD"}
                onChange={(e) => update("currency", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:opacity-60"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </select>
            </div>
          </fieldset>

          {status && (
            <p
              role="alert"
              className={`text-sm mt-4 rounded-lg px-4 py-3 border ${
                status.type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
