interface CleanupCardProps {
  title: string;
  count: number;
  description: string;
  onCleanup: () => void;
  loading?: boolean;
}

export function CleanupCard({ 
  title, 
  count, 
  description, 
  onCleanup,
  loading = false 
}: CleanupCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mb-2">{count}</p>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button
        onClick={onCleanup}
        disabled={loading || count === 0}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {loading ? "Cleaning..." : "Clean Up"}
      </button>
    </div>
  );
}
