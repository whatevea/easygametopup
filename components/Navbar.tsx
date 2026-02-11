"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_CHANGED_EVENT, notifyAuthChanged } from "@/lib/auth/client";

type MeResponse = {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    role: "USER" | "ADMIN";
    name: string | null;
  } | null;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/products", label: "Products" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const data = (await response.json()) as MeResponse;
      setMe(data);
    } catch {
      setMe({ authenticated: false, user: null });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe, pathname]);

  useEffect(() => {
    function onAuthChanged() {
      void loadMe();
    }

    function onFocus() {
      void loadMe();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadMe();
      }
    }

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadMe]);

  const profileText = useMemo(() => {
    if (!me?.authenticated || !me.user) {
      return "Guest";
    }

    return me.user.name ?? me.user.email;
  }, [me]);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setMe({ authenticated: false, user: null });
    setIsMenuOpen(false);
    notifyAuthChanged();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          EasyGameTopUp
        </Link>

        <button
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          type="button"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
            {isLoading ? "Loading..." : profileText}
          </span>

          {!me?.authenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-700"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-700"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                type="button"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-zinc-200 bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-zinc-200 pt-3">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                {isLoading ? "Loading profile" : profileText}
              </p>

              {!me?.authenticated ? (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
