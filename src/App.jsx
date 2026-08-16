import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Compare from "./pages/Compare";
import ChargeNeeded from "./pages/ChargeNeeded";
import ChargingTime from "./pages/ChargingTime";
import TripCalculator from "./pages/TripCalculator";
import VehicleDetails from "./pages/VehicleDetails";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function PageFade({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-offwhite">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <PageFade>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/charge-needed" element={<ChargeNeeded />} />
            <Route path="/charging-time" element={<ChargingTime />} />
            <Route path="/trip-calculator" element={<TripCalculator />} />
            <Route path="/vehicle" element={<VehicleDetails />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </PageFade>
      </main>
      <Footer />
    </div>
  );
}