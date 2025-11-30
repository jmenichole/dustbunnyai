"use client";

import { trpc } from "@/lib/trpc-client";
import Image from "next/image";
import Card from "@/components/Card";

export default function DashboardPage() {
  const { data: stats, isLoading } = trpc.inbox.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Image src="/brand/mascot-clean.png" alt="Loading mascot" width={160} height={140} sizes="(max-width: 640px) 120px, (max-width: 1024px) 140px, 160px" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Empty state: show mascot if no emails yet
  if ((stats?.totalEmails || 0) === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Image
            src="/brand/mascot-clean.png"
            alt="DustBunny cleaning mascot"
            width={260}
            height={220}
            sizes="(max-width: 640px) 200px, (max-width: 1024px) 220px, 260px"
            className="mx-auto mb-6 drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold mb-3">A fresh start! ✨</h2>
            <p className="text-gray-600 mb-6">
              Connect your Gmail and let the DustBunny begin tidying your inbox—classification, subscriptions, privacy scans and more.
            </p>
            <a
              href="/api/auth"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
            >
              Connect Gmail
            </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Total Emails</h3>
            <p className="text-3xl font-bold">{stats?.totalEmails || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Cleaned</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.cleaned || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Subscriptions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.subscriptions || 0}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm text-gray-600 mb-2">Space Saved</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.spaceSaved || 0} MB</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/dashboard/inbox" className="transition">
            <Card className="p-8 hover:shadow-soft">
            <h2 className="text-xl font-bold mb-2">📧 Inbox Cleaner</h2>
            <p className="text-gray-600">Clean up promotional and unwanted emails</p>
            </Card>
          </a>
          <a href="/dashboard/privacy" className="transition">
            <Card className="p-8 hover:shadow-soft">
            <h2 className="text-xl font-bold mb-2">🔒 Privacy Scan</h2>
            <p className="text-gray-600">Check for data breaches</p>
            </Card>
          </a>
          <a href="/dashboard/subscriptions" className="transition">
            <Card className="p-8 hover:shadow-soft">
            <h2 className="text-xl font-bold mb-2">📋 Subscriptions</h2>
            <p className="text-gray-600">Manage your subscriptions</p>
            </Card>
          </a>
          <a href="/dashboard/savings" className="transition">
            <Card className="p-8 hover:shadow-soft">
            <h2 className="text-xl font-bold mb-2">💰 Money Saver</h2>
            <p className="text-gray-600">Find savings opportunities</p>
            </Card>
          </a>
        </div>
      </div>
    </div>
  );
}
