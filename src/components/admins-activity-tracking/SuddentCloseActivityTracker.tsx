"use client";
import { useEffect } from "react";

export default function SuddentCloseActivityTracker({ userId }: { userId: number }) {
  useEffect(() => {
    let isReload = false;

    const handleUnload = () => {
      if (!isReload) {
        const data = { adminId: userId};

        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_ROOT_URL}/admins-activity/admin-logout-time`,
          new Blob([JSON.stringify(data)], { type: "application/json" })
        );
      }
    };

    // Detect reload with navigation timing API
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry?.type === "reload") {
      isReload = true;
    }

    // Safari/Firefox BFCache detection
    const handlePageHide = (e: PageTransitionEvent) => {
      if (e.persisted) {
        isReload = true;
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [userId]);

  return null;
}
