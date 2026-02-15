import { useEffect, useState } from "react";
import api from "../services/api";

interface Vehicle {
  id: number;
  plate_number: string;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreate = async () => {
    if (!plate.trim()) return;

    try {
      await api.post("/vehicles", {
        plate_number: plate,
      });

      setPlate("");
      fetchVehicles();
    } catch (err) {
      console.error(err);
      setError("Failed to create vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      setError("Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Vehicle Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your registered vehicles
        </p>
      </div>

      {/* Create Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Add New Vehicle
        </h2>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter plate number..."
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={handleCreate}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">
                Plate Number
              </th>
              <th className="p-4 font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  Loading vehicles...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">
                  No vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">{v.id}</td>
                  <td className="p-4 font-medium">
                    {v.plate_number}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}