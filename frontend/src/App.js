import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Admin from "./pages/admin/AdminLogin";
import NGODashboard from "./pages/ngo/NGODashboard";
import VolunteerDashboard from "./pages/users/VolunteerDashboard";
import EventDetailsPage from "./pages/users/EventDetailsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/ngo/LoginPage";
import NgoBlocked from "./pages/ngo/NgoBlocked";
import ManageEvents from "./pages/ngo/ManageEvents";
import TrackEvents from "./pages/ngo/TrackEvents";
import EditEvent from "./pages/ngo/EditEvent"
import Login from "./pages/users/Login";
import UserBlocked from "./pages/users/UserBlocked";
import PrivateRoute from "./components/Protected/PrivateRoute";
import NgoRoute from "./components/Protected/ngoRoute";
import AdminRoute from "./components/Protected/adminRoute";
import RegisterVolunteer from "./pages/users/RegisterVolunteer";
import RegisterNGO from "./pages/ngo/RegisterNGO";
import NgoHome from "./pages/ngo/NgoHome"
import ManageNGO from "./pages/admin/ManageNGO"
import ManageVolunteer from "./pages/admin/ManageVolunteer"
import ApprovedEvents from "./pages/admin/ApprovedEvents"
import RejectedEvents from "./pages/admin/RejectedEvents"
import AdminRegister from "./pages/admin/AdminRegister"
import ApproveEvents from "./pages/admin/ApproveEvents"
import CreateEvent from "./pages/ngo/CreateEvent"
import Profile from "./pages/users/Profile";


const App = () => {
  return (
    <Router>
      <Routes>

        {/* Default Routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* Home Routes */}
        <Route path="/ngo" element={<NgoHome />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<Admin />} />


        

        {/* Login Routes */}
        <Route path="/login-ngo" element={<LoginPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />

        {/* Register Routes */}
        <Route path="/register-admin" element={<AdminRegister />} />
        <Route path="/register-volunteer" element={<RegisterVolunteer />} />
        <Route path="/register-ngo" element={<RegisterNGO />} />

        

        {/* User/Volunteer Protected Routes */}
        <Route path="/volunteerdashboard" element={<PrivateRoute role="volunteer"><VolunteerDashboard /></PrivateRoute>} />
        <Route path="/event/:eventId" element={<PrivateRoute role="volunteer"><EventDetailsPage /></PrivateRoute>} />
        <Route path="/user/UserBlocked" element={<PrivateRoute role="volunteer"><UserBlocked /></PrivateRoute>} />
        <Route path="/user/editprofile" element={<PrivateRoute role="volunteer"><Profile /></PrivateRoute>} />
      

        
        {/* Admin Protected Routes */}
        <Route path="/admin-dashboard" element={ <AdminRoute  role="admin"><AdminDashboard /></AdminRoute>} />
        <Route path="/admin-dashboard/approve-events" element={<AdminRoute role="admin"><ApproveEvents/></AdminRoute> }/>
        
        <Route path="/admin-dashboard/manage-ngo" element={ <AdminRoute role="admin"><ManageNGO /></AdminRoute> }/>
        <Route path="/admin-dashboard/ManageVolunteer" element={ <AdminRoute role="admin"><ManageVolunteer/></AdminRoute> }/>
        <Route path="/admin-dashboard/approved-events" element={ <AdminRoute role="admin"><ApprovedEvents/></AdminRoute> }/>
        <Route path="/admin-dashboard/rejected-events" element={ <AdminRoute role="admin"><RejectedEvents/></AdminRoute> }/>


        {/* Ngo Protected Routes */}
        <Route path="/ngodashboard" element={<NgoRoute role="ngo"><NGODashboard /></NgoRoute>} />        
        <Route path="/ngo/create-event" element={<NgoRoute role="ngo"><CreateEvent /></NgoRoute>}/>
        <Route path="/ngo/blocked-ngo" element={<NgoRoute role="ngo"><NgoBlocked /></NgoRoute>}/>

        <Route path="/ngo/manage-events" element={<NgoRoute role="ngo"> <ManageEvents /></NgoRoute>} />
        <Route path="/ngo/edit-event/:eventId" element={<NgoRoute role="ngo"> <EditEvent /></NgoRoute>} />
        <Route path="/ngo/track-events" element={<NgoRoute role="ngo"> <TrackEvents /></NgoRoute>} />



      </Routes>
    </Router>
  );
};

export default App;
