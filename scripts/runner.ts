// scripts/runner.ts
// Lightweight scheduler runner for DustBunny AI cron jobs

import path from "path";

async function runJob(job: string) {
  switch (job) {
    case "scan-subscriptions":
      await import(path.resolve("src/cron/scan-subscriptions.ts"));
      break;
    case "daily-clean":
      await import(path.resolve("src/cron/daily-clean.ts"));
      break;
    case "weekly-report":
      await import(path.resolve("src/cron/weekly-report.ts"));
      break;
    default:
      console.error("Unknown job:", job);
      process.exit(1);
  }
}

const job = process.argv[2];
if (!job) {
  console.error("Usage: pnpm tsx scripts/runner.ts <job>");
  process.exit(1);
}

runJob(job).catch((err) => {
  console.error("Job failed:", err);
  process.exit(1);
});
