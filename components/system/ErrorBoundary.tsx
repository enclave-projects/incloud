"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Human-readable name for the feature, used in the error message. */
  label?: string;
  /** Custom fallback to render instead of the default error UI. */
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

function DefaultFallback({
  error,
  label,
  onReset,
}: {
  error: Error;
  label?: string;
  onReset: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center"
      style={{ border: "1px solid var(--dash-border)", background: "var(--dash-surface)" }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(239,68,68,0.1)" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
        >
          {label ? `${label} failed to load` : "Something went wrong"}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--dash-text-3)" }}>
          {error.message || "An unexpected error occurred. You can try again or reload the page."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--dash-accent)", color: "#fff" }}
        >
          Try again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="text-sm px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

/**
 * Wraps children in a React error boundary.
 * On error, shows a styled fallback with "Try again" / "Reload page" actions.
 *
 * @example
 * <ErrorBoundary label="File Manager">
 *   <FileManager ... />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.label ? ` / ${this.props.label}` : ""}]`,
      error,
      info.componentStack
    );
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultFallback
          error={this.state.error}
          label={this.props.label}
          onReset={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
