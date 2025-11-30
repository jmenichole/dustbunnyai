"use client";

import { trpc } from "@/lib/trpc-client";

export default function SavingsPage() {
  const { data: recommendations, isLoading } = trpc.savings.getRecommendations.useQuery();

  if (isLoading) {
    return <div className="p-8">Loading savings recommendations...</div>;
  }

  const totalSavings = recommendations?.reduce((sum, rec) => sum + (rec.savings || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Money Saver</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Potential Savings</h2>
          <p className="text-4xl font-bold text-green-600">${totalSavings.toFixed(2)}/mo</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recommendations</h2>
          </div>
          
          <div className="divide-y">
            {recommendations?.map((rec, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ${rec.savings?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
