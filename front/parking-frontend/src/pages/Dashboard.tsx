import { useEffect, useState } from "react";
import api from "../services/api";

interface DashboardData {
  name: string;
  email: string;
  total_paid: number;
  total_vehicles: number;
  active_reservations: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/users/dashboard");
        setData(res.data);
      } catch {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };

    fetchDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, {data.name}
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-gray-500 text-sm uppercase">
            Total Paid
          </h2>
          <h3 className="text-3xl font-bold text-green-600 mt-3">
            {Number(data.total_paid).toLocaleString()} บาท
          </h3>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-gray-500 text-sm uppercase">
            My Vehicles
          </h2>
          <h3 className="text-3xl font-bold text-blue-600 mt-3">
            {data.total_vehicles}
          </h3>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-gray-500 text-sm uppercase">
            Active Reservations
          </h2>
          <h3 className="text-3xl font-bold text-purple-600 mt-3">
            {data.active_reservations}
          </h3>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex gap-4">
        <button
          onClick={() => (window.location.href = "/dashboard/reservations")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          + จองที่จอด
        </button>

        <button
          onClick={() => (window.location.href = "/dashboard/vehicles")}
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          + เพิ่มรถ
        </button>
      </div>
    </div>
  );
}