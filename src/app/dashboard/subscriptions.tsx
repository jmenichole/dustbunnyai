"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricCard } from "@/components/MetricCard";
import { useState } from "react";
import { BunnyLoader } from "@/components/BunnyLoader";
import Card from "@/components/Card";

export default function SubscriptionsTab() {
  const [isDetecting, setIsDetecting] = useState(false);
  const { data: subs = [], refetch } = trpc.subscriptions.list.useQuery();
  const { data: costs } = trpc.subscriptions.costs.useQuery();
  const { data: recurring = [] } = trpc.subscriptions.recurring.useQuery();
  const unsubscribeMutation = trpc.subscriptions.unsubscribe.useMutation();
  const detectMutation = trpc.subscriptions.detect.useMutation();

  async function handleDetect() {
    setIsDetecting(true);
    try {
      const result = await detectMutation.mutateAsync();
      await refetch();
      alert(`✅ Detected ${result.detected} new subscriptions!`);
    } catch (error) {
      alert("Failed to detect subscriptions");
    } finally {
      setIsDetecting(false);
    }
  }

  async function handleUnsubscribe(id: string) {
    await unsubscribeMutation.mutateAsync({ id });
    refetch();
  }

  const active = subs.filter((s) => !s.unsubscribed);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="💳 Subscriptions" />
        <Button onClick={handleDetect} disabled={isDetecting}>
          {isDetecting ? <BunnyLoader size="sm" /> : "🔍 Detect Subscriptions"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active Subscriptions" value={active.length} />
        <MetricCard label="Monthly Cost" value={costs ? `$${costs.monthly.toFixed(2)}` : "$0.00"} />
        <MetricCard label="Yearly Cost" value={costs ? `$${costs.yearly.toFixed(2)}` : "$0.00"} />
        <MetricCard label="Unsubscribed" value={subs.length - active.length} />
      </div>

      {recurring.length > 0 && (
        <Card className="bg-blue-50 mb-6">
            <h3 className="font-semibold mb-2">Recurring Senders ({recurring.length})</h3>
            <p className="text-sm text-gray-600 mb-3">These senders email frequently but aren&apos;t tracked yet:</p>
          <div className="space-y-2">
            {recurring.slice(0, 5).map((r, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="text-gray-500 ml-2">({r.emailCount} emails)</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {active.map((sub) => (
          <Card key={sub.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{sub.name}</h3>
                <p className="text-sm text-gray-600">{sub.email}</p>
                {sub.category && <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">{sub.category}</span>}
                {sub.cost && (
                  <p className="text-sm font-medium text-green-600 mt-1">
                    ${sub.cost}/{sub.frequency}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Last email: {sub.lastEmailDate ? new Date(sub.lastEmailDate).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <Button onClick={() => handleUnsubscribe(sub.id)} variant="outline" size="sm">
                Unsubscribe
              </Button>
            </div>
          </Card>
        ))}
        {active.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No active subscriptions detected. Click &quot;Detect Subscriptions&quot; above.
          </p>
        )}
      </div>
    </div>
  );
}
