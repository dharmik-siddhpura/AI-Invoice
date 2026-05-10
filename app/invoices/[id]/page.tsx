export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceActions from "./InvoiceActions";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: true, business: true },
  });

  if (!invoice) notFound();

  const total = invoice.items.reduce((s, i) => s + i.quantity * i.rate, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Issued {new Date(invoice.issueDate).toLocaleDateString()} · Due{" "}
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
          <InvoiceActions invoiceId={invoice.id} currentStatus={invoice.status} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 max-w-3xl">
          <div className="flex justify-between mb-10">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">From</p>
              <p className="font-semibold text-gray-900">{invoice.business.name}</p>
              <p className="text-gray-500 text-sm">{invoice.business.email}</p>
              <p className="text-gray-500 text-sm">{invoice.business.address}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</p>
              <p className="font-semibold text-gray-900">{invoice.client.name}</p>
              <p className="text-gray-500 text-sm">{invoice.client.email}</p>
              <p className="text-gray-500 text-sm">{invoice.client.address}</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-gray-700 text-sm">{item.description}</td>
                  <td className="py-3 text-right text-gray-600 text-sm">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600 text-sm">${item.rate.toFixed(2)}</td>
                  <td className="py-3 text-right text-gray-900 font-medium text-sm">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Due</p>
              <p className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</p>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-gray-600 text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
