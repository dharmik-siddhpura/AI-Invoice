"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELDS = [
  { field: "name", label: "Client Name", placeholder: "Acme Corp", required: true },
  { field: "email", label: "Email", placeholder: "billing@acme.com", required: true, type: "email" },
  { field: "phone", label: "Phone", placeholder: "+1 234 567 890" },
  { field: "address", label: "Address", placeholder: "123 Main Street" },
  { field: "city", label: "City", placeholder: "New York" },
  { field: "country", label: "Country", placeholder: "United States" },
];

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const save = async () => {
    setError("");
    if (!form.name.trim()) { setError("Client name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save client.");
        return;
      }
      router.push("/clients");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add Client</h1>
          <p className="text-gray-500 text-sm mt-1">Add a new client to start sending invoices</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm max-w-xl">
          <fieldset disabled={saving} className="space-y-4">
            {FIELDS.map(({ field, label, placeholder, required, type }) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  id={field}
                  type={type ?? "text"}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:opacity-60"
                />
              </div>
            ))}
          </fieldset>

          {error && (
            <p role="alert" className="text-red-600 text-sm mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.back()}
              disabled={saving}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Client"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
