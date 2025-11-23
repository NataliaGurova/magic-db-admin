
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Magic DB
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/admin"
            // className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Admin Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}
