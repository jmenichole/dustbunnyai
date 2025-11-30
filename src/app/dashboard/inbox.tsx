"use client";

import { trpc } from "@/lib/trpc-client";
import { useState } from "react";

export default function InboxPage() {
  const [syncing, setSyncing] = useState(false);
  const { data: emails, isLoading, refetch } = trpc.inbox.getEmails.useQuery({
    category: "promotional",
    limit: 50,
  });

  const cleanupMutation = trpc.inbox.cleanup.useMutation();

  const handleCleanup = async (emailIds: string[]) => {
    await cleanupMutation.mutateAsync({ emailIds });
    refetch();
  };

  const syncGmail = async () => {
    setSyncing(true);
    try {
      const response = await fetch("/api/gmail", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max: 50 })
      });
      const data = await response.json();
      console.log("Synced emails:", data);
      refetch();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading emails...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Inbox Cleaner</h1>
          <button
            onClick={syncGmail}
            disabled={syncing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {syncing ? "Syncing..." : "🔄 Sync Gmail"}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Promotional Emails</h2>
            <p className="text-gray-600">Review and clean up promotional emails</p>
          </div>
          
          <div className="divide-y">
            {emails && emails.length > 0 ? (
              emails.map((email) => (
                <div key={email.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{email.subject}</h3>
                      <p className="text-sm text-gray-600">{email.from}</p>
                      <p className="text-xs text-gray-500">{email.snippet}</p>
                    </div>
                    <button
                      onClick={() => handleCleanup([email.id])}
                      className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">No emails found. Click &quot;Sync Gmail&quot; to fetch your emails.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
