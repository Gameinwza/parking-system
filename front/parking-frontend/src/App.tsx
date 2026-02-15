import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Register from "./pages/Register"; // 👈 เพิ่ม
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Reservation from "./pages/Reservation";
import MyReservations from "./pages/MyReservation";
import AdminSpots from "./pages/AdminSpots";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/vehicles"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Vehicles />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/reservations"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reservation />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/my-reservations"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MyReservations />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
  path="/dashboard/admin/users"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <AdminUsers />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/dashboard/admin/spots"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <AdminSpots />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;