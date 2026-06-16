export const metadata = { title: "Offline · Tri" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <div className="text-5xl">🌳</div>
      <h1 className="mt-4 text-2xl font-bold">You&apos;re offline</h1>
      <p className="mt-2 text-muted">
        Tri needs a connection to grow your tree. Reconnect and it&apos;ll load
        right up.
      </p>
    </div>
  );
}
