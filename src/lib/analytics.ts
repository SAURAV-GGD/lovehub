"use client";

export type ConsentStatus = "accepted" | "declined" | "pending";

const CONSENT_STORAGE_KEY = "lovehub_cookie_consent";
const CONSENT_TIMESTAMP_KEY = "lovehub_cookie_consent_timestamp";
const BEHAVIOR_LOG_KEY = "lovehub_behavior_events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Get current cookie consent status from localStorage
 */
export function getCookieConsent(): ConsentStatus {
  if (typeof window === "undefined") return "pending";
  try {
    const val = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (val === "accepted" || val === "declined") return val;
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return "pending";
}

/**
 * Set cookie consent status and notify listeners
 */
export function setCookieConsent(status: "accepted" | "declined"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());

    window.dispatchEvent(
      new CustomEvent("lovehub:consent-change", { detail: { status } })
    );

    if (status === "accepted") {
      trackEvent("consent_granted", { category: "legal" });
    } else {
      trackEvent("consent_declined", { category: "legal" });
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Track user behavioral events (page views, button clicks, funnel progress)
 * Only logs detailed analytics if consent is accepted or for critical anonymous metrics.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  const consent = getCookieConsent();
  const timestamp = new Date().toISOString();
  const eventPayload = {
    event: eventName,
    timestamp,
    url: window.location.pathname,
    referrer: document.referrer || null,
    properties: properties || {},
  };

  // If user accepted analytics cookies, pass to Google Analytics (gtag) if present
  if (consent === "accepted") {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, properties);
    }

    // Save recent customer behavior in sessionStorage for session-level customer journey analysis
    try {
      const existing = JSON.parse(
        sessionStorage.getItem(BEHAVIOR_LOG_KEY) || "[]"
      );
      existing.push(eventPayload);
      // Keep last 50 events in session
      if (existing.length > 50) existing.shift();
      sessionStorage.setItem(BEHAVIOR_LOG_KEY, JSON.stringify(existing));
    } catch {
      // Ignore sessionStorage errors
    }
  }

  // Developer logging in non-production or for verification
  if (process.env.NODE_ENV === "development") {
    console.debug(`[LoveHub Analytics:${consent}]`, eventName, properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string): void {
  trackEvent("page_view", { page: pageName, title: document.title });
}
