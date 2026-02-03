import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Guest pages
import {
  Explore,
  ExperienceDetailsPage,
  BookingForm,
  PaymentPage,
  BookingConfirmation,
  Storefront,
  Booking,
  Confirmation,
  AppView,
  Profile,
  TripPlannerChat,
  RestaurantDetail,
  Wishlists,
  AllRestaurants,
  AllExperiences,
  GuestGuide,
  MyBookings,
  Itinerary,
  SharedItinerary,
  TripItinerary,
  PaymentSuccess,
} from "./pages/guest";

// Host pages
import {
  HostDashboard,
  HostVendors,
  AddVendor,
  HostProfile,
  HostAuth,
  EditHostProfile,
  PaymentSettings,
  PayoutHistory,
  HostBookings,
  HostActiveVendors,
  HostEarnings,
  HostRatings,
  HostStorefront,
  HostVendorManagement,
} from "./pages/host";

// Vendor pages
import {
  VendorDashboard,
  AddService,
  VendorProfile,
  VendorSettings,
  VendorPaymentSettings,
  VendorPayoutHistory,
  AllBookings,
  ActiveHosts,
  RevenueBreakdown,
  VendorRatings,
  CreateVendorProfile,
  VendorProfilePreview,
  VendorPublicProfile,
  VendorBookingForm,
  TestInstagramScrape,
} from "./pages/vendor";

// Auth pages
import {
  Auth,
  ResetPassword,
  ChangePassword,
  SignIn,
  SignOut,
} from "./pages/auth";

// Marketing pages
import {
  ForHosts,
  ForVendors,
  SplashPage,
} from "./pages/marketing";

// Legal pages
import {
  PrivacyPolicy,
  TermsOfService,
  HelpSupport,
} from "./pages/legal";

// Admin pages
import {
  PlatformSettings,
  AdminPromoCodes,
  VendorApprovals,
} from "./pages/admin";

// Standalone pages
import NotFound from "./pages/NotFound";

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
    return <Navigate to="/auth?role=vendor" replace />;
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
    <Route path="/" element={<SplashPage />} />
    {/* Legacy route - redirect to unified auth */}
    <Route path="/select-role" element={<Navigate to="/auth" replace />} />
    
    <Route path="/appview" element={<AppView />} />
    
    {/* Guest/Public Routes */}
    <Route path="/explore" element={<Explore />} />
    <Route path="/experience/:id" element={<ExperienceDetailsPage />} />
    <Route path="/booking/:id" element={<BookingForm />} />
    <Route path="/booking/:id/payment" element={<PaymentPage />} />
    <Route path="/booking/:id/confirmed" element={<BookingConfirmation />} />
    <Route path="/storefront/:hostId" element={<HostStorefront />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/bookings" element={<MyBookings />} />
    <Route path="/for-hosts" element={<ForHosts />} />
    <Route path="/for-vendors" element={<ForVendors />} />
    <Route path="/trip-planner" element={<TripPlannerChat />} />
    <Route path="/trip-planner/itinerary" element={<TripItinerary />} />
    <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
    <Route path="/itinerary/shared/:token" element={<SharedItinerary />} />
    <Route path="/shared/:token" element={<SharedItinerary />} />
    <Route path="/restaurant/:id" element={<RestaurantDetail />} />
    <Route path="/restaurants" element={<AllRestaurants />} />
    <Route path="/experiences" element={<AllExperiences />} />
    <Route path="/wishlists" element={<Wishlists />} />
    <Route path="/guide/:hostId" element={<GuestGuide />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/vendor/upload-photos" element={<TestInstagramScrape />} />
    <Route path="/vendor/create-profile" element={<ProtectedVendorRoute><CreateVendorProfile /></ProtectedVendorRoute>} />
    <Route path="/vendor/edit-profile" element={<ProtectedVendorRoute><CreateVendorProfile /></ProtectedVendorRoute>} />
    <Route path="/vendor/preview" element={<ProtectedVendorRoute><VendorProfilePreview /></ProtectedVendorRoute>} />
    <Route path="/vendor/preview/:id" element={<ProtectedVendorRoute><VendorProfilePreview /></ProtectedVendorRoute>} />
    <Route path="/vendor/:id" element={<VendorPublicProfile />} />
    <Route path="/vendor/:id/book" element={<VendorBookingForm />} />
    <Route path="/vendor/:id/payment" element={<PaymentPage />} />
    <Route path="/booking/:id/success" element={<PaymentSuccess />} />
    <Route path="/vendor/:id/confirmed" element={<BookingConfirmation />} />
    
    {/* Admin Routes */}
    <Route path="/admin/settings" element={<PlatformSettings />} />
    <Route path="/admin/promo-codes" element={<AdminPromoCodes />} />
    <Route path="/admin/vendor-approvals" element={<VendorApprovals />} />
    
    {/* Host Routes */}
    <Route path="/auth/host" element={<HostAuth />} />
    {/* Legacy signup routes redirect to unified auth */}
    <Route path="/signup/host" element={<Navigate to="/auth?role=host" replace />} />
    <Route path="/signup/host/property" element={<Navigate to="/auth?role=host" replace />} />
    
    {/* Host Profile Sub-pages */}
    <Route path="/host/edit-profile" element={<ProtectedHostRoute><EditHostProfile /></ProtectedHostRoute>} />
    <Route path="/host/payment-settings" element={<ProtectedHostRoute><PaymentSettings /></ProtectedHostRoute>} />
    <Route path="/host/payout-history" element={<ProtectedHostRoute><PayoutHistory /></ProtectedHostRoute>} />
    <Route path="/host/change-password" element={<ProtectedHostRoute><ChangePassword /></ProtectedHostRoute>} />
    <Route path="/host/help-support" element={<ProtectedHostRoute><HelpSupport /></ProtectedHostRoute>} />
    <Route path="/host/bookings" element={<ProtectedHostRoute><HostBookings /></ProtectedHostRoute>} />
    <Route path="/host/vendors/active" element={<ProtectedHostRoute><HostActiveVendors /></ProtectedHostRoute>} />
    <Route path="/host/vendors/manage" element={<ProtectedHostRoute><HostVendorManagement /></ProtectedHostRoute>} />
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
    {/* Legacy signup routes redirect to unified auth */}
    <Route path="/signup/vendor" element={<Navigate to="/auth?role=vendor" replace />} />
    <Route path="/signup/vendor/business" element={<Navigate to="/auth?role=vendor" replace />} />
    <Route 
      path="/vendor/dashboard" 
      element={
        <ProtectedVendorRoute>
          <VendorDashboard />
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
      path="/vendor/settings" 
      element={
        <ProtectedVendorRoute>
          <VendorSettings />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/payment-settings" 
      element={
        <ProtectedVendorRoute>
          <VendorPaymentSettings />
        </ProtectedVendorRoute>
      } 
    />
    <Route 
      path="/vendor/payout-history" 
      element={
        <ProtectedVendorRoute>
          <VendorPayoutHistory />
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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ProfileProvider>
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
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
