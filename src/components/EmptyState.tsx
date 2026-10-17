interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  role?: "status" | "alert";
}

function EmptyState({ icon, title, description, action, role }: EmptyStateProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center text-center border border-dashed border-gray-300 rounded-xl bg-white px-6 py-12"
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
