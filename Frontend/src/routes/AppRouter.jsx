import { Routes, Route } from "react-router-dom";

import Home from "../pages/landing/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import LoginAdmin from "../pages/auth/LoginAdmin";

import DashboardUser from "../pages/user/DashboardUser";
import Cart from "../pages/user/Cart";
import History from "../pages/user/History";
import Settings from "../pages/user/Settings";
import Invoice from "../pages/user/Invoice";

import DashboardAdmin from "../pages/admin/DashboardAdmin";
import ProductsAdmin from "../pages/admin/ProductsAdmin";
import ServicesAdmin from "../pages/admin/ServicesAdmin";
import OrdersAdmin from "../pages/admin/OrdersAdmin";
import SettingsAdmin from "../pages/admin/SettingsAdmin";

import ProtectedRoute from "./ProtectedRoute";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/admin" element={<LoginAdmin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <DashboardUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/invoice/:id"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        <Route path="/admin/products" element={<ProductsAdmin />} />
        <Route path="/admin/services" element={<ServicesAdmin />} />
        <Route path="/admin/orders" element={<OrdersAdmin />} />
        <Route path="/admin/settings" element={<SettingsAdmin />} />
      </Route>
    </Routes>
  );
}

