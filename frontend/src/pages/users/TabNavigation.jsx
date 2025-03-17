const TabNavigation = ({ activeTab, setActiveTab }) => {
    return (
      <div className="bg-white shadow-md">
        <div className="flex justify-center space-x-4 p-4">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`px-4 py-2 rounded-lg ${activeTab === "foryou" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`px-4 py-2 rounded-lg ${activeTab === "joined" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Joined Events
          </button>
        </div>
      </div>
    );
  };
  
  export default TabNavigation;