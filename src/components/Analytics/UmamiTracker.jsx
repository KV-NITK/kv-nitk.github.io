import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function UmamiTracker() {
  const location = useLocation();

  useEffect(() => {
    const websiteId =
      import.meta.env.VITE_UMAMI_WEBSITE_ID ||
      "ca6f3d23-4369-4e89-8322-6e4666818e3d";
    const scriptUrl =
      import.meta.env.VITE_UMAMI_SCRIPT_URL ||
      "https://cloud.umami.is/script.js";

    if (!websiteId) return;

    let script = document.querySelector(`script[data-website-id="${websiteId}"]`);
    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      script.setAttribute("data-website-id", websiteId);
      script.setAttribute("data-auto-track", "true");
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // SPA route change tracking
    if (window.umami && typeof window.umami.track === "function") {
      try {
        window.umami.track((props) => ({
          ...props,
          url: location.pathname + location.search,
          title: document.title,
        }));
      } catch (err) {
        // Ignore tracking errors in dev
      }
    }
  }, [location]);

  return null;
}
