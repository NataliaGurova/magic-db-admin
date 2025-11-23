import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Welcome to Magic!</h1>
        <p className="text-lg text-gray-600">
          Manage your Magic: The Gathering collection!
        </p>

        {/* <div className="mt-8">
          <a
            href="/admin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Admin
          </a>
        </div> */}
      </main>
    </>
  );
}
