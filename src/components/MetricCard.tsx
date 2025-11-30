interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export function MetricCard({ label, value, icon, color = "blue" }: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    red: "text-red-600",
  };

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">{label}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
        {value}
      </p>
    </div>
  );
}
