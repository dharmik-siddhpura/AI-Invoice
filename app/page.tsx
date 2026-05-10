export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";

async function getStats() {
  const [totalInvoices, paidInvoices, draftInvoices, clients, revenueAgg, recentInvoices] =
    await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: "PAID" } }),
      prisma.invoice.count({ where: { status: "DRAFT" } }),
      prisma.client.count(),
      prisma.invoiceItem.findMany({
        where: { invoice: { status: "PAID" } },
        select: { quantity: true, rate: true },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          number: true,
          status: true,
          dueDate: true,
          client: { select: { name: true } },
          items: { select: { quantity: true, rate: true } },
        },
      }),
    ]);

  const revenue = revenueAgg.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  return { totalInvoices, paidInvoices, draftInvoices, clients, revenue, recentInvoices };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

async function DashboardContent() {
  const { totalInvoices, paidInvoices, draftInvoices, clients, revenue, recentInvoices } =
    await getStats();

  const stats = [
    { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, sub: "from paid invoices" },
    { label: "Total Invoices", value: totalInvoices, sub: `${paidInvoices} paid` },
    { label: "Drafts", value: draftInvoices, sub: "pending to send" },
    { label: "Clients", value: clients, sub: "total clients" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-gray-400 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
          <Link href="/invoices" className="text-indigo-600 text-sm hover:underline">View all</Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <p className="text-4xl mb-3">◧</p>
            <p className="font-medium text-gray-600">No invoices yet</p>
            <p className="text-sm mt-1">
              {clients === 0
                ? "Start by adding a client first"
                : "Create your first AI-powered invoice"}
            </p>
            <Link
              href={clients === 0 ? "/clients/new" : "/invoices/new"}
              className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {clients === 0 ? "Add Client" : "Create Invoice"}
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Invoice</th>
                <th className="px-6 py-3 text-left">Client</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentInvoices.map((inv) => {
                const total = inv.items.reduce((s, i) => s + i.quantity * i.rate, 0);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/invoices/${inv.id}`} className="text-indigo-600 font-medium hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{inv.client.name}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">${total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-2 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-64 animate-pulse" />
    </>
  );
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s your overview.</p>
          </div>
          <Link
            href="/invoices/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            ⚡ New Invoice with AI
          </Link>
        </div>
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
