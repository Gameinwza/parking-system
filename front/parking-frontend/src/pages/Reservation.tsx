import { useEffect, useState } from "react";
import api from "../services/api";

interface Floor {
  floor: number;
}

interface Spot {
  id: number;
  spot_number: string;
  floor: number;
  status: string;
}

interface Vehicle {
  id: number;
  plate_number: string;
}

export default function Reservation() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);

  // ========================
  // Initial Load
  // ========================
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const [floorsRes, vehiclesRes] = await Promise.all([
          api.get("/reservations/floors"),
          api.get("/vehicles"),
        ]);

        setFloors(floorsRes.data);
        setVehicles(vehiclesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ========================
  // Load Spots By Floor
  // ========================
  const handleFloorChange = async (floor: number) => {
    try {
      setSelectedFloor(floor);
      setSelectedSpot(null);
      setLoading(true);

      const res = await api.get(`/reservations/floor/${floor}`);
      setSpots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Create Reservation
  // ========================
  const handleReserve = async () => {
    if (!vehicleId || !selectedSpot || !startTime || !endTime) return;

    try {
      setLoading(true);

      await api.post("/reservations", {
        vehicle_id: vehicleId,
        spot_id: selectedSpot,
        start_time: startTime,
        end_time: endTime,
      });

      alert("Reservation created!");

      // Refresh spots
      if (selectedFloor) {
        const res = await api.get(
          `/reservations/floor/${selectedFloor}`
        );
        setSpots(res.data);
      }

      setSelectedSpot(null);
    } catch (err) {
      console.error(err);
      alert("Error creating reservation");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    vehicleId && selectedSpot && startTime && endTime;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Parking Reservation
      </h1>

      {/* Loading */}
      {loading && (
        <div className="mb-4 text-blue-600 font-medium">
          Loading...
        </div>
      )}

      {/* Floor Select */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Select Floor
        </label>
        <select
          className="border rounded-lg px-4 py-2 w-48"
          value={selectedFloor ?? ""}
          onChange={(e) =>
            handleFloorChange(Number(e.target.value))
          }
        >
          <option value="">Choose Floor</option>
          {floors.map((f) => (
            <option key={f.floor} value={f.floor}>
              Floor {f.floor}
            </option>
          ))}
        </select>
      </div>

      {/* Spot Grid */}
      {selectedFloor && (
        <>
          <div className="mb-4 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded" />
              Available
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded" />
              Selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              Reserved
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {spots.map((spot) => {
              const isReserved =
                spot.status === "reserved";
              const isSelected =
                selectedSpot === spot.id;

              return (
                <button
                  key={spot.id}
                  disabled={isReserved}
                  onClick={() =>
                    setSelectedSpot(spot.id)
                  }
                  className={`
                    p-4 rounded-xl font-semibold transition
                    ${
                      isReserved
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : isSelected
                        ? "bg-green-600 text-white"
                        : "bg-blue-200 hover:bg-blue-300"
                    }
                  `}
                >
                  {spot.spot_number}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Reservation Form */}
      {selectedFloor && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border rounded-lg px-4 py-2"
            value={vehicleId ?? ""}
            onChange={(e) =>
              setVehicleId(Number(e.target.value))
            }
          >
            <option value="">
              Select Vehicle
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate_number}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            className="border rounded-lg px-4 py-2"
            value={startTime}
            onChange={(e) =>
              setStartTime(e.target.value)
            }
          />

          <input
            type="datetime-local"
            className="border rounded-lg px-4 py-2"
            value={endTime}
            onChange={(e) =>
              setEndTime(e.target.value)
            }
          />
        </div>
      )}

      {/* Reserve Button */}
      {selectedFloor && (
        <button
          onClick={handleReserve}
          disabled={!isFormValid || loading}
          className={`
            mt-6 px-6 py-2 rounded-lg transition
            ${
              isFormValid
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          Reserve Spot
        </button>
      )}
    </div>
  );
}