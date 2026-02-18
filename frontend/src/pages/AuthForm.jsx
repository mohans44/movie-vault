import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSignature,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const initialSignup = {
  name: "",
  username: "",
  mail: "",
  password: "",
  confirmPassword: "",
};

export default function AuthForm({ defaultMode = "login" }) {
  const [mode, setMode] = useState(defaultMode);
  const { login, signup } = useAuth();
  const [form, setForm] = useState(initialSignup);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(user, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const message = err?.message || "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await signup(form);
      toast.success("Signup successful!");
      navigate("/");
    } catch (err) {
      const message = err?.message || "Signup failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setForm(initialSignup);
    setUser("");
    setPassword("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-4 sm:py-8">
      <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-cta/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center md:min-h-[78vh]">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/15 shadow-card md:grid-cols-2">
          <section className="hidden bg-[linear-gradient(165deg,rgba(114,132,255,0.2),rgba(56,217,214,0.09),rgba(10,12,20,0.78))] p-8 md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Flick Deck</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-text-main leading-tight">
                Track every watch,
                <br />
                keep your vibe list sharp.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-text-soft">
              Log what you watched, rate it in seconds, and build a personal catalog that looks as good as your taste.
            </p>
          </section>

          <section className="glass-panel p-4 sm:p-6 md:p-8">
            <div className="mb-5 sm:mb-7">
              <h1 className="font-display text-2xl font-bold text-text-main sm:text-3xl">
                {mode === "login" ? "Sign in" : "Create account"}
              </h1>
              <p className="mt-1 text-sm text-text-soft">
                {mode === "login"
                  ? "Continue where you left off."
                  : "Start building your movie journal."}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <form
              onSubmit={mode === "login" ? handleLogin : handleSignup}
              className="space-y-4"
            >
              {mode === "signup" && (
                <>
                  <InputField
                    icon={<FaSignature size={16} />}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    autoFocus
                    required
                  />
                  <InputField
                    icon={<FaUser size={16} />}
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                  />
                  <InputField
                    icon={<FaEnvelope size={16} />}
                    type="email"
                    name="mail"
                    value={form.mail}
                    onChange={handleChange}
                    placeholder="Email address"
                    required
                  />
                </>
              )}

              {mode === "login" && (
                <InputField
                  icon={<FaUser size={16} />}
                  type="text"
                  value={user}
                  onChange={(event) => setUser(event.target.value)}
                  placeholder="Username or email"
                  autoFocus
                  required
                />
              )}

              <InputField
                icon={<FaLock size={16} />}
                type={showPass ? "text" : "password"}
                name={mode === "login" ? undefined : "password"}
                value={mode === "login" ? password : form.password}
                onChange={
                  mode === "login"
                    ? (event) => setPassword(event.target.value)
                    : handleChange
                }
                placeholder="Password"
                required
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="rounded-lg p-2 text-text-soft hover:bg-white/10 hover:text-text-main"
                    onClick={() => setShowPass((prev) => !prev)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                }
              />

              {mode === "signup" && (
                <InputField
                  icon={<FaLock size={16} />}
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="rounded-lg p-2 text-text-soft hover:bg-white/10 hover:text-text-main"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  }
                />
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl border border-primary/45 bg-primary/85 px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:bg-primary"
              >
                {mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-sm text-text-soft">
                {mode === "login" ? "New to Flick Deck?" : "Already have an account?"}
              </p>
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-primary hover:text-text-main"
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Create one now" : "Sign in instead"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, rightIcon, className = "", ...props }) {
  return (
    <div className="group relative">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 z-10 text-text-soft group-focus-within:text-primary">
          {icon}
        </div>
        <input
          className={`h-12 w-full rounded-xl border border-white/15 bg-background/35 pl-10 text-sm text-text-main placeholder:text-text-soft/80 transition focus:border-primary/50 focus:outline-none ${
            rightIcon ? "pr-12" : "pr-4"
          } ${className}`}
          {...props}
        />
        {rightIcon && <div className="absolute right-1 z-10">{rightIcon}</div>}
      </div>
    </div>
  );
}
