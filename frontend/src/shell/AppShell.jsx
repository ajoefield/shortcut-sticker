import { useEffect, useState } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Navbar: fixed at the top */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="bg-zinc-950/70 border-b border-white/10 w-full">
          <div className="flex items-center justify-between h-14 w-screen px-0">
            {/* Hamburger (left) */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="primary-menu"
              onClick={() => setOpen((o) => !o)}
              className="shrink-0 p-4 rounded-none hover:bg-white/5 border-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {/* Home (right) */}
            <Link
              to="/"
              aria-label="Home"
              className="shrink-0 p-4 rounded-none hover:bg-white/5 border-0 mr-6"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
        {/* Dropdown menu */}
        {open && (
          <nav
            id="primary-menu"
            role="menu"
            aria-label="Primary"
            tabIndex="-1"
            className="absolute left-0 top-14 z-50 w-72 rounded-xl border border-white/10 bg-zinc-900/95 shadow-xl"
          >
            <ul className="flex flex-col p-2 gap-1">
              <MenuLink to="/profile" onClick={() => setOpen(false)}>
                My Profile
              </MenuLink>
              <MenuLink to="/browse" onClick={() => setOpen(false)}>
                Browse Shortcuts
              </MenuLink>
              <MenuLink to="/create" onClick={() => setOpen(false)}>
                Create shortcuts layout
              </MenuLink>
            </ul>
          </nav>
        )}
      </header>

      {/* Main content (centered, with top padding for navbar) */}
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <main className="max-w-6xl mx-auto px-4 pt-16 pb-10">
          <Outlet />
        </main>
        <footer className="border-t border-white/10 mt-10 py-6 text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} Shortcut Designer
        </footer>
      </div>
    </>
  );
}

function MenuLink({ to, children, onClick }) {
  const base =
    "block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20";
  const active = "bg-white/10";
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) => `${base} ${isActive ? active : ""}`}
        role="menuitem"
      >
        {children}
      </NavLink>
    </li>
  );
}
