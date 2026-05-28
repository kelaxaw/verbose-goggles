export function ItemCount({ count }: { count: number }) {
  return (
    <div className="fixed top-4 right-4 z-50 rounded-xl bg-black/80 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm tabular-nums">
      {count} items
    </div>
  );
}
