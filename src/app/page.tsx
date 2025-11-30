import React from "react";
import Image from "next/image";
import Card from "@/components/Card";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full text-center py-24 px-6 overflow-hidden gradient-hero">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Your inbox has a mess.<br />Meet the AI that cleans it.
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            DustBunny AI finds your subscriptions, deletes junk, unsubscribes from spam,
            and saves you money automatically — with a cute little bunny doing all the hard work.
          </p>
          <div className="flex justify-center gap-4 mb-10">
            <a
              href="/dashboard"
              className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg shadow-lg hover:opacity-90 transition"
            >
              Start Cleaning — It&apos;s Free
            </a>
            <a
              href="/api/auth"
              className="bg-white border border-purple-200 text-purple-700 px-6 py-3 rounded-xl text-lg shadow hover:bg-purple-50 transition"
            >
              Sign In with Gmail
            </a>
          </div>
          <div className="flex justify-center mt-8">
            <Image
              src="/brand/mascot-hero.png"
              width={480}
              height={340}
              alt="DustBunny mascot celebrating a clean inbox"
              priority
              sizes="(max-width: 640px) 320px, (max-width: 1024px) 400px, 480px"
              className="drop-shadow-2xl rounded-3xl max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 py-16 max-w-6xl mx-auto px-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">🧹 Inbox Cleanup</h3>
          <p className="text-gray-600">Finds junk, groups receipts, highlights important messages — automatically.</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">🔔 Subscription Finder</h3>
          <p className="text-gray-600">See every subscription you&apos;re paying for — even the ones you forgot existed.</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">🚫 Auto-Unsubscribe</h3>
          <p className="text-gray-600">DustBunny handles all the annoying unsubscribe flows so you never have to.</p>
        </Card>
      </section>

      {/* Savings Section */}
      <section className="bg-gray-50 py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-6">🤑 Saves you real money</h2>
        <p className="text-center text-gray-700 max-w-xl mx-auto mb-12">
          Users save an average of <strong>$300–$1200/year</strong> by canceling forgotten subscriptions.
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <a
          href="/dashboard"
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-xl shadow-md hover:opacity-90 transition"
        >
          Start Cleaning — Free Forever Plan Available
        </a>
      </section>
    </main>
  );
}
