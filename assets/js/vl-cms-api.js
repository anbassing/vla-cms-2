/**
 * Visit Locals — native WordPress/ACF REST API client.
 * Frontend runs on Vercel; /api/* proxies requests to:
 * https://cms.visitindonesia.co.id/wp-json/wp/v2/experience
 */
(function (window) {
  "use strict";

  const DEFAULT_BASE = window.VL_CMS_API_BASE || "/api";

  function buildUrl(path, params) {
    const url = new URL(
      DEFAULT_BASE.replace(/\/$/, "") + "/" + path.replace(/^\//, ""),
      window.location.origin
    );
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  async function request(path, params) {
    const response = await fetch(buildUrl(path, params), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      let detail = "";
      try { detail = await response.text(); } catch (_) {}
      throw new Error("Visit Locals CMS API " + response.status + ": " + detail);
    }

    return response.json();
  }

  async function getExperiences(options) {
    return request("experiences", {
      search: options?.search || ""
    });
  }

  async function getExperience(slug) {
    if (!slug) throw new Error("Experience slug is required.");
    return request("experiences/" + encodeURIComponent(slug));
  }

  function whatsappUrl(number, message) {
    const clean = String(number || "").replace(/\D/g, "");
    return "https://wa.me/" + clean + "?text=" + encodeURIComponent(message || "");
  }

  window.VisitLocalsCMS = {
    baseUrl: DEFAULT_BASE,
    getExperiences,
    getExperience,
    whatsappUrl
  };
})(window);
