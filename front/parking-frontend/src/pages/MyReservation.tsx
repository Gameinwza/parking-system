import { useEffect, useState } from "react";
import api from "../services/api";

interface Reservation {
  id: number;
  spot_number: string;
  floor: number;
  plate_number: string;
  start_time: string;
  end_time: string;
  status: "pending" | "paid" | "cancelled" | "expired";
}

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reservations/my");
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this reservation?")) return;

    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
    } catch {
      alert("Error cancelling reservation");
    }
  };

  // 🔥 สร้าง payment + รับ QR
  const handlePay = async (reservationId: number) => {
    try {
      const res = await api.post("/payments", {
        reservation_id: reservationId,
        amount: 100,
      });

      setQrCode(res.data.qr_code);
      setPaymentId(res.data.payment_id);
    } catch {
      alert("Payment failed");
    }
  };

  // 🔥 กดยืนยันว่าจ่ายแล้ว
  const handleVerify = async () => {
    if (!paymentId) return;

    try {
      await api.post(`/payments/verify/${paymentId}`);
      alert("Payment verified!");

      setQrCode(null);
      setPaymentId(null);
      fetchReservations();
    } catch {
      alert("Verify failed");
    }
  };

  const statusBadge = (status: string) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium";

    switch (status) {
      case "pending":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>;
      case "paid":
        return <span className={`${base} bg-green-100 text-green-700`}>Paid</span>;
      case "cancelled":
        return <span className={`${base} bg-gray-200 text-gray-600`}>Cancelled</span>;
      case "expired":
        return <span className={`${base} bg-red-100 text-red-600`}>Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">My Reservations</h1>

      {loading && <div>Loading...</div>}

      {reservations.length === 0 && !loading && (
        <div>No reservations found.</div>
      )}

      <div className="grid gap-6">
        {reservations.map((r) => (
          <div key={r.id} className="bg-white shadow-md rounded-2xl p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">
                  Spot {r.spot_number} (Floor {r.floor})
                </h2>
                <p>Vehicle: {r.plate_number}</p>
                <p>Start: {new Date(r.start_time).toLocaleString()}</p>
                <p>End: {new Date(r.end_time).toLocaleString()}</p>
                <div className="mt-2">{statusBadge(r.status)}</div>
              </div>

              {r.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handlePay(r.id)}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                  >
                    Pay Now
                  </button>

                  <button
                    onClick={() => handleCancel(r.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 QR Modal */}
      {qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center space-y-4">
            <h2 className="text-xl font-semibold">Scan to Pay</h2>

            <img src={qrCode} alt="QR Code" className="mx-auto w-64" />

            <button
              onClick={handleVerify}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              ฉันชำระเงินแล้ว
            </button>

            <button
              onClick={() => setQrCode(null)}
              className="block text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}