"use client";
import { useEffect, useRef } from "react";
import { bodyMarkup } from "../lib/markup";

const SCRIPT_URLS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js",
  "https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js",
  "/app-logic.js",
];

export default function HomePage() {
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function loadNext(i) {
      if (cancelled || i >= SCRIPT_URLS.length) return;
      const script = document.createElement("script");
      script.src = SCRIPT_URLS[i];
      script.onload = () => loadNext(i + 1);
      document.body.appendChild(script);
    }
    loadNext(0);

    return () => {
      cancelled = true;
    };
  }, []);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: bodyMarkup }} />;
}
