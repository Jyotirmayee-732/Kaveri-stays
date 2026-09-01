import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { Home } from "./pages/Home";
import { Properties } from "./pages/Properties";
import { PropertyDetails } from "./pages/PropertyDetails";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { GuestDashboard } from "./pages/GuestDashboard";
import { BookingDetails } from "./pages/BookingDetails";
import { Payment } from "./pages/Payment";
import { Review } from "./pages/Review";
import { StaffDashboard } from "./pages/StaffDashboard";
import { StaffBookings } from "./pages/StaffBookings";
import { StaffGuests } from "./pages/StaffGuests";
import { StaffRooms } from "./pages/StaffRooms";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#1C1917]">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:propertyId" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Guest Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <GuestDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:bookingId"
                  element={
                    <ProtectedRoute>
                      <BookingDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:bookingId/payment"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:bookingId/review"
                  element={
                    <ProtectedRoute>
                      <Review />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Protected Routes */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "manager", "owner"]}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/bookings"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "manager", "owner"]}>
                      <StaffBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/guests"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "manager", "owner"]}>
                      <StaffGuests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/rooms"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "manager", "owner"]}>
                      <StaffRooms />
                    </ProtectedRoute>
                  }
                />

                {/* Manager Protected Routes */}
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "owner"]}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager/reports"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "owner"]}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Protected Route */}
                <Route
                  path="/owner"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
