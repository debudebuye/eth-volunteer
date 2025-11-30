const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-2 py-4">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`
              relative px-6 py-2.5 rounded-lg font-medium transition-all duration-300
              ${
                activeTab === "foryou"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }
            `}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              For You
            </span>
            {activeTab === "foryou" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("joined")}
            className={`
              relative px-6 py-2.5 rounded-lg font-medium transition-all duration-300
              ${
                activeTab === "joined"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }
            `}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Joined Events
            </span>
            {activeTab === "joined" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;