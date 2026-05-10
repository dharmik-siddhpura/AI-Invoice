export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">{clients.length} clients</p>
          </div>
          <Link
            href="/clients/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Client
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {clients.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400">
              <p className="text-5xl mb-3">◉</p>
              <p className="font-medium text-gray-600">No clients yet</p>
              <p className="text-sm mt-1">Add your first client to start invoicing</p>
              <Link
                href="/clients/new"
                className="mt-4 inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add First Client
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-100">
                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Invoices</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{client.email}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{client.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {client._count.invoices} invoices
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/invoices/new?client=${client.id}`} className="text-indigo-600 text-sm hover:underline">
                        New Invoice
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
