interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function SectionTitle({ title, subtitle, icon }: SectionTitleProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
