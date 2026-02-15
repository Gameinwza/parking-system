import { useState } from "react";
import api from "../services/api";

export default function AdminSpots() {
  const [spotNumber, setSpotNumber] = useState("");
  const [floor, setFloor] = useState<number>(1);

  const handleCreate = async () => {
    await api.post("/admin/spots", {
      spotNumber,
      floor
    });

    alert("Spot created!");
    setSpotNumber("");
  };

  return (
    <div className="p-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6">Create Parking Spot</h2>

      <input
        placeholder="Spot Number (A1)"
        value={spotNumber}
        onChange={(e) => setSpotNumber(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded"
      />

      <input
        type="number"
        value={floor}
        onChange={(e) => setFloor(Number(e.target.value))}
        className="w-full mb-4 px-4 py-2 border rounded"
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Create
      </button>
    </div>
  );
}