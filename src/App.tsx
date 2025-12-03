import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SplashScreen } from "./components/SplashScreen";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { ScrollToTop } from "./components/ScrollToTop";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import ExperienceDetailsPage from "./pages/ExperienceDetailsPage";
import BookingForm from "./pages/BookingForm";
import PaymentPage from "./pages/PaymentPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import HostStorefront from "./pages/HostStorefront";
import Storefront from "./pages/Storefront";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import HostDashboard from "./pages/HostDashboard";
import HostSignup from "./pages/HostSignup";
import HostPropertyInfo from "./pages/HostPropertyInfo";
import HostVendors from "./pages/HostVendors";
import AddVendor from "./pages/AddVendor";
import HostProfile from "./pages/HostProfile";
import VendorSignup from "./pages/VendorSignup";
import VendorBusinessDetails from "./pages/VendorBusinessDetails";
import VendorDashboard from "./pages/VendorDashboard";
import VendorServices from "./pages/VendorServices";
import AddService from "./pages/AddService";
import VendorProfile from "./pages/VendorProfile";
import AllBookings from "./pages/AllBookings";
import ActiveHosts from "./pages/ActiveHosts";
import RevenueBreakdown from "./pages/RevenueBreakdown";
import SignIn from "./pages/SignIn";
import SignOut from "./pages/SignOut";
import NotFound from "./pages/NotFound";
import HostAuth from "./pages/HostAuth";
import EditHostProfile from "./pages/EditHostProfile";
import PaymentSettings from "./pages/PaymentSettings";
import PayoutHistory from "./pages/PayoutHistory";
import ChangePassword from "./pages/ChangePassword";
import HelpSupport from "./pages/HelpSupport";
import HostBookings from "./pages/HostBookings";
import HostActiveVendors from "./pages/HostActiveVendors";
import HostEarnings from "./pages/HostEarnings";
import HostRatings from "./pages/HostRatings";
import VendorRatings from "./pages/VendorRatings";
import AppView from "./pages/AppView";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import TripPlannerChat from "./pages/TripPlannerChat";
import RestaurantDetail from "./pages/RestaurantDetail";
import Wishlists from "./pages/Wishlists";

// Protected route component for hosts - uses Supabase session for authentication
const ProtectedHostRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, role } = useAuthContext();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/host" replace />;
  }
  
  // If user has vendor role, redirect to vendor dashboard
  if (role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Protected route component for vendors - uses Supabase session for authentication
const ProtectedVendorRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, role } = useAuthContext();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signup/vendor" replace />;
  }
  
  // If user has host role, redirect to host dashboard
  if (role === 'host') {
    return <Navigate to="/host/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Generic protected route that just checks authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/appview" element={<AppView />} />
    
    {/* Guest/Public Routes */}
    <Route path="/explore" element={<Explore />} />
    <Route path="/experience/:id" element={<ExperienceDetailsPage />} />
    <Route path="/booking/:id" element={<BookingForm />} />
    <Route path="/booking/:id/payment" element={<PaymentPage />} />
    <Route path="/booking/:id/confirmed" element={<BookingConfirmation />} />
    <Route path="/storefront/:hostId" element={<HostStorefront />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/trip-planner-chat" element={<ProtectedRoute><TripPlannerChat /></ProtectedRoute>} />
    <Route path="/restaurant/:id" element={<RestaurantDetail />} />
    <Route path="/wishlists" element={<ProtectedRoute><Wishlists /></ProtectedRoute>} />
    
    {/* Legacy routes */}
    <Route path="/storefront/:id" element={<Storefront />} />
    <Route path="/booking/:id" element={<Booking />} />
    <Route path="/confirmation" element={<Confirmation />} />
    
    {/* Host Routes */}
    <Route path="/auth/host" element={<HostAuth />} />
    <Route path="/signup/host" element={<HostSignup />} />
    <Route path="/signup/host/property" element={<HostPropertyInfo />} />
    
    {/* Host Profile Sub-pages */}
    <Route path="/host/edit-profile" element={<ProtectedHostRoute><EditHostProfile /></ProtectedHostRoute>} />
    <Route path="/host/payment-settings" element={<ProtectedHostRoute><PaymentSettings /></ProtectedHostRoute>} />
    <Route path="/host/payout-history" element={<ProtectedHostRoute><PayoutHistory /></ProtectedHostRoute>} />
    <Route path="/host/change-password" element={<ProtectedHostRoute><ChangePassword /></ProtectedHostRoute>} />
    <Route path="/host/help-support" element={<ProtectedHostRoute><HelpSupport /></ProtectedHostRoute>} />
    <Route path="/host/bookings" element={<ProtectedHostRoute><HostBookings /></ProtectedHostRoute>} />
    <Route path="/host/vendors/active" element={<ProtectedHostRoute><HostActiveVendors /></ProtectedHostRoute>} />
    <Route path="/host/earnings" element={<ProtectedHostRoute><HostEarnings /></ProtectedHostRoute>} />
    <Route path="/host/ratings" element={<ProtectedHostRoute><HostRatings /></ProtectedHostRoute>} />
    <Route 
      path="/host/dashboard" 
      element={
        <ProtectedHostRoute>
          <HostDashboard />
        </ProtectedHostRoute>
      } 
    />
    <Route 
      path="/host/vendors" 
      element={
        <ProtectedHostRoute>
          <HostVendors />
        </ProtectedHostRoute>
      } 
    />
    <Route 
      path="/host/vendors/add" 
      element={
        <ProtectedHostRoute>
          <AddVendor />
        </ProtectedHostRoute>
      } 
    />
    <Route 
      path="/host/profile" 
      element={
        <ProtectedHostRoute>
          <HostProfile />
        </ProtectedHostRoute>
      } 
    />
    
    {/* Vendor Routes */}
    <Route path="/signup/vendor" element={<VendorSignup />} />
    <Route path="/signup/vendor/business" element={<VendorBusinessDetails />} />
    <Route 
      path="/vendor/dashboard" 
      element={
        <ProtectedVendorRoute>
          <VendorDashboard />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/services" 
      element={
        <ProtectedVendorRoute>
          <VendorServices />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/services/add" 
      element={
        <ProtectedVendorRoute>
          <AddService />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/bookings" 
      element={
        <ProtectedVendorRoute>
          <AllBookings />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/hosts" 
      element={
        <ProtectedVendorRoute>
          <ActiveHosts />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/revenue" 
      element={
        <ProtectedVendorRoute>
          <RevenueBreakdown />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/profile" 
      element={
        <ProtectedVendorRoute>
          <VendorProfile />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/ratings" 
      element={
        <ProtectedVendorRoute>
          <VendorRatings />
        </ProtectedVendorRoute>
      } 
    />
    
    <Route path="/signin" element={<SignIn />} />
    <Route path="/signout" element={<SignOut />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash once per session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {showSplash && <SplashScreen onComplete={handleSplashComplete} duration={4000} />}
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
