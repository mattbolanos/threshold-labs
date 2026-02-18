"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type State = {
  email: string;
  error: string | null;
  isGoogleLoading: boolean;
  isLoading: boolean;
  password: string;
};

type Action =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "START_LOADING" }
  | { type: "STOP_LOADING" }
  | { type: "START_GOOGLE_LOADING" };

const initialState: State = {
  email: "",
  error: null,
  isGoogleLoading: false,
  isLoading: false,
  password: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "START_LOADING":
      return { ...state, error: null, isLoading: true };
    case "STOP_LOADING":
      return { ...state, isLoading: false };
    case "START_GOOGLE_LOADING":
      return { ...state, error: null, isGoogleLoading: true };
    default:
      return state;
  }
}

export function LoginForm() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { email, password, error, isLoading, isGoogleLoading } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "START_LOADING" });

    await authClient.signIn.email(
      {
        callbackURL: "/",
        email,
        password,
      },
      {
        onError: (ctx) => {
          dispatch({
            payload: ctx.error.message || "Invalid email or password",
            type: "SET_ERROR",
          });
          dispatch({ type: "STOP_LOADING" });
        },
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    dispatch({ type: "START_GOOGLE_LOADING" });

    await authClient.signIn.social({
      callbackURL: "/",
      errorCallbackURL: `${window.location.origin}/unauthorized`,
      provider: "google",
    });
  };

  return (
    <div className="bg-card/85 rounded-xl border p-7 shadow-xl shadow-black/[0.03] backdrop-blur-sm dark:shadow-black/20">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            autoComplete="email"
            id="email"
            onChange={(e) =>
              dispatch({ payload: e.target.value, type: "SET_EMAIL" })
            }
            placeholder="athlete@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="current-password"
            id="password"
            onChange={(e) =>
              dispatch({ payload: e.target.value, type: "SET_PASSWORD" })
            }
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </div>

        {error && (
          <div
            aria-live="polite"
            className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button
          className="w-full font-semibold tracking-wide"
          disabled={isLoading || isGoogleLoading}
          size="lg"
          type="submit"
        >
          {isLoading ? (
            <>
              <IconLoader2 className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-3 tracking-widest">
            Or
          </span>
        </div>
      </div>

      <Button
        className="w-full"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleSignIn}
        size="lg"
        variant="outline"
      >
        {isGoogleLoading ? (
          <>
            <IconLoader2 className="animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <IconBrandGoogleFilled className="size-4" />
            <span>Continue with Google</span>
          </>
        )}
      </Button>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          className="text-primary font-medium underline-offset-4 transition-colors hover:underline"
          href="/signup"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
