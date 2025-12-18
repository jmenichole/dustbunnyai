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
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    frequency: "",
    cost: "",
    currency: "USD",
  });
  const [formError, setFormError] = useState("");
  
  const { data: subs = [], refetch } = trpc.subscriptions.list.useQuery();
  const { data: costs } = trpc.subscriptions.costs.useQuery();
  const { data: recurring = [] } = trpc.subscriptions.recurring.useQuery();
  const unsubscribeMutation = trpc.subscriptions.unsubscribe.useMutation();
  const detectMutation = trpc.subscriptions.detect.useMutation();
  const addManualMutation = trpc.subscriptions.addManual.useMutation();

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

  async function handleAddManual(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    
    try {
      const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
      const frequency = formData.frequency && validFrequencies.includes(formData.frequency) 
        ? (formData.frequency as "daily" | "weekly" | "monthly" | "yearly")
        : undefined;

      await addManualMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        category: formData.category || undefined,
        frequency: frequency,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        currency: formData.currency || undefined,
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        category: "",
        frequency: "",
        cost: "",
        currency: "USD",
      });
      setShowAddForm(false);
      refetch();
    } catch (error: any) {
      setFormError(error.message || "Failed to add subscription");
    }
  }

  const active = subs.filter((s) => !s.unsubscribed);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="💳 Subscriptions" />
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline">
            ➕ Add Manual
          </Button>
          <Button onClick={handleDetect} disabled={isDetecting}>
            {isDetecting ? <BunnyLoader size="sm" /> : "🔍 Detect from Gmail"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Active Subscriptions" value={active.length} />
        <MetricCard label="Monthly Cost" value={costs ? `$${costs.monthly.toFixed(2)}` : "$0.00"} />
        <MetricCard label="Yearly Cost" value={costs ? `$${costs.yearly.toFixed(2)}` : "$0.00"} />
        <MetricCard label="Unsubscribed" value={subs.length - active.length} />
      </div>

      {showAddForm && (
        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4">Add Subscription Manually</h3>
          <form onSubmit={handleAddManual} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Netflix"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="info@netflix.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="streaming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="9.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                {formError}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Subscription
              </Button>
            </div>
          </form>
        </Card>
      )}

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
