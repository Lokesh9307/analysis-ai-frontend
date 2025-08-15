"use client";

export default function MobileMessage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#0f141b] to-[#1e2633] text-center p-6">
      <div className="bg-[#1f2937] p-8 rounded-2xl shadow-lg max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-4">📊 Desktop Only</h1>
        <p className="text-gray-300 mb-6">
          This dashboard experience is designed for large screens.  
          Please use a laptop or desktop to access all features.
        </p>
        <div className="bg-gray-800 text-gray-400 text-sm p-4 rounded-lg border border-gray-700">
          Tip: Rotate your tablet to landscape mode for better visibility.
        </div>
      </div>
    </div>
  );
}
