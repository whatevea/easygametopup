"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { notifyAuthChanged } from "@/lib/auth/client";

type GoogleAuthButtonProps = {
  mode: "login" | "register";
};

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!scriptLoaded || !clientId || !window.google || !buttonContainerRef.current) {
      return;
    }

    const onCredential = async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError("Google did not return a valid credential.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiResponse = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: response.credential }),
        });

        if (!apiResponse.ok) {
          const data = (await apiResponse.json()) as { error?: string };
          setError(data.error ?? "Google authentication failed.");
          return;
        }

        notifyAuthChanged();
        router.refresh();
        router.push("/profile");
      } catch {
        setError("Google authentication request failed.");
      } finally {
        setLoading(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onCredential,
    });

    buttonContainerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonContainerRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: mode === "register" ? "signup_with" : "signin_with",
      width: 360,
    });
  }, [clientId, mode, router, scriptLoaded]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      setScriptLoaded(true);
    }
  }, []);

  if (!clientId) {
    return (
      <p className="text-sm text-zinc-600">
        Google sign-in is disabled. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your environment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={buttonContainerRef} className="flex justify-center" />
      {loading ? <p className="text-center text-xs text-zinc-500">Processing Google sign-in...</p> : null}
      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
