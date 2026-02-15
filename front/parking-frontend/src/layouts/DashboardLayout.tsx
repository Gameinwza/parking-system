import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let role: string | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch {
      role = null;
    }
  }

  const linkStyle =
    "block px-4 py-2 rounded-lg transition font-medium";

  const activeStyle = "bg-white text-black";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">
          Parking System
        </h2>

        <nav className="space-y-3">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkStyle} ${
                isActive ? activeStyle : "hover:bg-gray-800"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/dashboard/vehicles"
            className={({ isActive }) =>
              `${linkStyle} ${
                isActive ? activeStyle : "hover:bg-gray-800"
              }`
            }
          >
            Vehicles
          </NavLink>

          <NavLink
            to="/dashboard/reservations"
            className={({ isActive }) =>
              `${linkStyle} ${
                isActive ? activeStyle : "hover:bg-gray-800"
              }`
            }
          >
            New Reservation
          </NavLink>

          <NavLink
            to="/dashboard/my-reservations"
            className={({ isActive }) =>
              `${linkStyle} ${
                isActive ? activeStyle : "hover:bg-gray-800"
              }`
            }
          >
            My Reservations
          </NavLink>

          {/* Admin Section */}
          {role === "admin" && (
            <>
              <div className="pt-6 text-xs uppercase text-gray-400">
                Admin
              </div>

              <NavLink
                to="/dashboard/admin/users"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive ? activeStyle : "hover:bg-gray-800"
                  }`
                }
              >
                Manage Users
              </NavLink>

              <NavLink
                to="/dashboard/admin/spots"
                className={({ isActive }) =>
                  `${linkStyle} ${
                    isActive ? activeStyle : "hover:bg-gray-800"
                  }`
                }
              >
                Manage Spots
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>

          <div className="text-xs text-gray-400 mt-4">
            © 2026 Parking Inc.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-2xl shadow-md p-6 min-h-[80vh]">
          {children}
        </div>
      </main>
    </div>
  );
}