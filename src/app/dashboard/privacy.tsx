"use client";

import { trpc } from "@/lib/trpc-client";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricCard } from "@/components/MetricCard";
import { useState } from "react";
import { BunnyLoader } from "@/components/BunnyLoader";
import Card from "@/components/Card";

export default function PrivacyTab() {
  const [isScanning, setIsScanning] = useState(false);
  const { data: scans = [], refetch } = trpc.privacy.scans.useQuery();
  const scanBreachesMutation = trpc.privacy.scanBreaches.useMutation();
  const scanPIIMutation = trpc.privacy.scanPII.useMutation();
  const dismissMutation = trpc.privacy.dismiss.useMutation();

  async function handleScanBreaches() {
    setIsScanning(true);
    try {
      const result = await scanBreachesMutation.mutateAsync();
      await refetch();
      if (result.breached) {
        alert(`⚠️ Found ${result.breaches.length} data breaches!`);
      } else {
        alert("✅ No breaches found!");
      }
    } catch (error) {
      alert("Failed to scan for breaches");
    } finally {
      setIsScanning(false);
    }
  }

  async function handleScanPII() {
    setIsScanning(true);
    try {
      const result = await scanPIIMutation.mutateAsync();
      await refetch();
      if (result.issues > 0) {
        alert(`⚠️ Found ${result.issues} potential privacy issues!`);
      } else {
        alert("✅ No PII issues found!");
      }
    } catch (error) {
      alert("Failed to scan for PII");
    } finally {
      setIsScanning(false);
    }
  }

  async function handleDismiss(id: string) {
    await dismissMutation.mutateAsync({ id });
    refetch();
  }

  const highSeverity = (scans ?? []).filter((s: any) => s.severity === "high").length;
  const mediumSeverity = (scans ?? []).filter((s: any) => s.severity === "medium").length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SectionTitle title="🔒 Privacy & Security" />
        <div className="flex gap-2">
          <Button onClick={handleScanBreaches} disabled={isScanning} variant="outline">
            {isScanning ? <BunnyLoader size="sm" /> : "🔍 Scan Breaches"}
          </Button>
          <Button onClick={handleScanPII} disabled={isScanning}>
            {isScanning ? <BunnyLoader size="sm" /> : "🔍 Scan PII"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Issues" value={scans.length} />
        <MetricCard label="High Severity" value={highSeverity} />
        <MetricCard label="Medium Severity" value={mediumSeverity} />
      </div>

      <div className="space-y-3">
        {(scans as any[]).map((scan) => (
          <Card key={scan.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{scan.issue}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      scan.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : scan.severity === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {scan.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{scan.email}</p>
                <p className="text-sm text-gray-700 mt-1">{scan.description}</p>
                {scan.breachName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Breach: {scan.breachName} ({scan.breachDate ? new Date(scan.breachDate).toLocaleDateString() : "Unknown"})
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Detected: {new Date(scan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => handleDismiss(scan.id)} variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </Card>
        ))}
        {scans.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No privacy issues detected. Click &quot;Scan Breaches&quot; or &quot;Scan PII&quot; above to check.
          </p>
        )}
      </div>
    </div>
  );
}
