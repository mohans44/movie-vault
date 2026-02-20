import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
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
import Lounge from "./pages/Lounge";
import LoungeDiscussion from "./pages/LoungeDiscussion";

function LegacyPersonRedirect() {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={`/people/${id}${location.search}`} replace />;
}

function LegacyLoungeDiscussionRedirect() {
  const { discussionId } = useParams();
  const location = useLocation();
  return <Navigate to={`/community/lounge/${discussionId}${location.search}`} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen flex flex-col text-text-main">
          <div className="pointer-events-none fixed inset-0 cinematic-grid opacity-[0.14]" />
          <div className="pointer-events-none fixed inset-0 film-grain" />
          <ScrollToTop />
          <Navbar />
          <main className="relative z-10 flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/people/:id" element={<PersonDetails />} />
              <Route path="/account/profile" element={<Profile />} />
              <Route path="/discover/search" element={<SearchResults />} />
              <Route path="/community/lounge" element={<Lounge />} />
              <Route path="/community/lounge/:discussionId" element={<LoungeDiscussion />} />
              <Route path="/account/watched" element={<WatchedMovies />} />
              <Route path="/account/watchlist" element={<Watchlist />} />

              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/person/:id" element={<LegacyPersonRedirect />} />
              <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
              <Route path="/search" element={<Navigate to="/discover/search" replace />} />
              <Route path="/lounge" element={<Navigate to="/community/lounge" replace />} />
              <Route path="/lounge/:discussionId" element={<LegacyLoungeDiscussionRedirect />} />
              <Route path="/watched-movies" element={<Navigate to="/account/watched" replace />} />
              <Route path="/watchlist" element={<Navigate to="/account/watchlist" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer className="relative z-10" />
        </div>
      </Router>
    </AuthProvider>
  );
}
