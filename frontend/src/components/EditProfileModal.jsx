import { useEffect, useState } from "react";
import { X, UserPen, KeyRound } from "lucide-react";

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSave,
  isSaving = false,
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(user?.name || "");
    setUsername(user?.username || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
  }, [isOpen, user?.name, user?.username]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !username.trim()) {
      setError("Name and username are required.");
      return;
    }

    const wantsPasswordUpdate =
      currentPassword || newPassword || confirmNewPassword;

    if (wantsPasswordUpdate) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setError("Fill current, new, and confirm password fields.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New password and confirmation must match.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
    }

    try {
      await onSave({
        name: name.trim(),
        username: username.trim(),
        currentPassword: wantsPasswordUpdate ? currentPassword : undefined,
        newPassword: wantsPasswordUpdate ? newPassword : undefined,
        confirmNewPassword: wantsPasswordUpdate ? confirmNewPassword : undefined,
      });
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to save profile changes.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-surface/95 p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-text-main">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 p-1.5 text-text-soft hover:text-text-main"
          >
            <X size={16} />
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-xs text-text-soft">Full Name</label>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-3 py-2">
              <UserPen size={14} className="text-text-soft" />
              <input
                className="w-full bg-transparent text-sm text-text-main outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-text-soft">Username</label>
            <div className="rounded-xl border border-white/15 bg-black/20 px-3 py-2">
              <input
                className="w-full bg-transparent text-sm text-text-main outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
          </div>

          <div className="pt-1">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-text-soft">
              <KeyRound size={12} />
              Change Password
            </p>
            <div className="space-y-2">
              <input
                type="password"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-text-main outline-none"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
              <input
                type="password"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-text-main outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
              <input
                type="password"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-text-main outline-none"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs text-text-soft hover:text-text-main"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl border border-primary/45 bg-primary/85 px-3 py-2 text-xs font-semibold text-background disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
