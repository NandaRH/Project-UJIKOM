import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Settings, Clock, Grid } from "react-feather";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 border px-3 py-1 rounded-md text-sm hover:bg-gray-50 transition">
        <User size={18} />
        {user.email}
      </button>
      <div className="absolute right-0 hidden group-hover:block bg-white border rounded-md mt-2 w-48 p-2 text-sm shadow-md">
        <Link to="/user/dashboard" className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1">
          <Grid size={14} /> Dashboard
        </Link>
        <Link to="/user/history" className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1">
          <Clock size={14} /> History
        </Link>
        <Link to="/user/settings" className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1">
          <Settings size={14} /> Pengaturan
        </Link>
        <button
          onClick={() => { logout(); nav("/"); }}
          className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 w-full text-left mt-1"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
