interface AlertBoxProps {
  type: "info" | "warning" | "error" | "success";
  title?: string;
  message: string;
}

export function AlertBox({ type, title, message }: AlertBoxProps) {
  const styles = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ️",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "⚠️",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "❌",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "✅",
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} ${style.border} border rounded-lg p-4 ${style.text}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{style.icon}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
