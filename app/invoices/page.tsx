import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, items: true },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500 text-sm mt-1">{invoices.length} total invoices</p>
          </div>
          <Link
            href="/invoices/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            ⚡ New Invoice with AI
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {invoices.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400">
              <p className="text-5xl mb-3">◧</p>
              <p className="font-medium text-gray-600">No invoices yet</p>
              <p className="text-sm mt-1">Let AI generate your first invoice in seconds</p>
              <Link
                href="/invoices/new"
                className="mt-4 inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Create First Invoice
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Invoice #</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Issue Date</th>
                  <th className="px-6 py-3 text-left">Due Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => {
                  const total = inv.items.reduce((s, i) => s + i.quantity * i.rate, 0);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-600 font-semibold hover:underline">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{inv.client.name}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">${total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-600 text-sm hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
