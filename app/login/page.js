"use client";
import { useState } from "react";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/";
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Gagal masuk.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          width: "min(90vw, 360px)",
        }}
      >
        <h4 style={{ fontWeight: 700, marginBottom: 4 }}>ZenFund</h4>
        <p style={{ color: "#6c757d", fontSize: "0.9rem", marginBottom: 20 }}>
          Masukkan passcode untuk masuk.
        </p>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          autoFocus
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "1px solid #eee",
            background: "#f8f9fa",
            fontSize: "1.1rem",
            marginBottom: 16,
          }}
        />
        {error && (
          <div style={{ color: "#dc3545", fontSize: "0.85rem", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#0d6efd",
            color: "white",
            fontWeight: 700,
            fontSize: "1.05rem",
          }}
        >
          {loading ? "..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
