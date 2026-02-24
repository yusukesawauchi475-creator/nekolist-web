export type Lang = "ja" | "en";

export function getLang(): Lang {
  if (typeof window === "undefined") return "ja";

  const path = window.location.pathname || "";
  if (path.startsWith("/eng")) return "en";

  try {
    const params = new URLSearchParams(window.location.search || "");
    if (params.get("lang") === "en") return "en";
  } catch {
    // ignore
  }

  return "ja";
}

