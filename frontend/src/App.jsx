import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./utils/ScrollToTop";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import WatchedMovies from "./pages/WatchedMovies";
import Watchlist from "./pages/Watchlist";
import AuthForm from "./pages/AuthForm";
import MovieDetails from "./pages/MovieDetails";
import PersonDetails from "./pages/PersonDetails";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen flex flex-col text-text-main">
          <div className="pointer-events-none fixed inset-0 cinematic-grid opacity-20" />
          <div className="pointer-events-none fixed inset-0 film-grain" />
          <ScrollToTop />
          <Navbar />
          <main className="relative z-10 flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthForm />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/person/:id" element={<PersonDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/watched-movies" element={<WatchedMovies />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer className="relative z-10" />
        </div>
      </Router>
    </AuthProvider>
  );
}
