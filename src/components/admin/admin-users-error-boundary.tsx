"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class AdminUsersErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-3 rounded-xl border p-5" role="alert">
          <p className="font-medium">Unable to load users</p>
          <p className="text-sm text-muted-foreground">
            Check your connection and try again. If this continues, reload the
            page to check your admin session.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
