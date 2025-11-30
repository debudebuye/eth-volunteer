/**
 * Loading Skeleton Component
 * Shows animated placeholder while content is loading
 */
const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6">
          {/* Image skeleton */}
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          
          {/* Description skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
