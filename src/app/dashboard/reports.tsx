"use client";

import { trpc } from "@/lib/trpc-client";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricCard } from "@/components/MetricCard";
import Card from "@/components/Card";

export default function ReportsTab() {
  const { data: reports = [] } = trpc.reports.list.useQuery();
  const { data: latest } = trpc.reports.getLatest.useQuery();

  return (
    <div>
      <SectionTitle title="📊 AI Reports" />

      {latest && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 mb-6 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Latest Weekly Summary</h3>
            <span className="text-sm text-gray-600">
              {new Date(latest.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{latest.summary}</p>

          {latest && (latest as any).details && (latest as any).details.stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MetricCard
                label="Total Emails"
                value={(latest as any).details.stats.total || 0}
              />
              <MetricCard
                label="Promotional"
                value={(latest as any).details.stats.promotional || 0}
              />
              <MetricCard
                label="Important"
                value={(latest as any).details.stats.important || 0}
              />
              <MetricCard
                label="Spam"
                value={(latest as any).details.stats.spam || 0}
              />
              <MetricCard
                label="Personal"
                value={(latest as any).details.stats.personal || 0}
              />
            </div>
          )}
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Report History</h3>
        {(reports as any[]).map((report) => (
          <Card key={report.id}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold capitalize">Weekly Report</h4>
              <span className="text-xs text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{report.summary}</p>
          </Card>
        ))}
        {reports.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No reports generated yet. Weekly reports are generated automatically every Monday.
          </p>
        )}
      </div>
    </div>
  );
}
 
