import { useState, useEffect } from "react";

const ManageVolunteer = () => {
  const [users, setUsers] = useState([]);

  // Fetch users from the backend
  useEffect(() => {
    fetch("http://localhost:5000/api/users") // Replace with your actual API endpoint
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  // Handle delete action
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        // Remove the deleted user from the state
        setUsers(users.filter((user) => user._id !== id));
      })
      .catch((error) => console.error("Error deleting user:", error));
  };

  // Handle block action
  const handleBlock = async (id, isCurrentlyBlocked) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}/block`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked }), // Toggle block/unblock
      });

      const data = await response.json();

      if (response.ok) {
        // Update the user's blocked status in the state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, isBlocked: !isCurrentlyBlocked } : user
          )
        );
        // alert(data.message); 
      } else {
        // alert(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Manage Volunteer Users</h2>
      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-100">
                  <td className="py-3 px-4 border-b">{user.name}</td>
                  <td className="py-3 px-4 border-b">{user.email}</td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md mr-3 hover:bg-red-600 transition-all"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleBlock(user._id, user.isBlocked)}
                      className={`${
                        user.isBlocked ? "bg-green-500" : "bg-yellow-500"
                      } text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition-all`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageVolunteer;
