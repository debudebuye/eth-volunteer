/**
 * Empty State Component
 * Shows when no data is available
 */
const EmptyState = ({ title, message, icon = "📭" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md">{message}</p>
    </div>
  );
};

export default EmptyState;
