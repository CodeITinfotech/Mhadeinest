import "./tokens.css";
import { useState } from "react";

export function QuietLuxury() {
  const [bookHovered, setBookHovered] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Full-bleed image — no overlay, no compromise */}
      <img
        src="/__mockup/images/hero.png"
        alt="Mhadeinest"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 40%",
        }}
      />

      {/* Only the barest hint of gradient at bottom for legibility */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "38%",
          background: "linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.12) 60%, transparent 100%)",
        }}
      />

      {/* Minimal top-left nav — no background, tiny */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 36,
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
        }}
      >
        <img
          src="/__mockup/images/logo_transparent.png"
          alt="logo"
          style={{ width: 28, height: 28, objectFit: "contain", filter: "brightness(0) invert(1)" }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16,
            color: "rgba(255,255,255,0.92)",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          Mhadeinest
        </span>
      </div>

      {/* Top-right — minimal nav links */}
      <div
        style={{
          position: "absolute",
          top: 32,
          right: 36,
          display: "flex",
          gap: 28,
          zIndex: 10,
        }}
      >
        {["Stays", "Experiences", "About"].map((item) => (
          <span
            key={item}
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Bottom-left — the entire narrative, whispered */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 52,
          zIndex: 10,
          maxWidth: 520,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "hsl(35 80% 70%)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 24, height: 1, background: "hsl(35 80% 60%)" }} />
          Mandovi River · Goa, India
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 58,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.08,
            margin: "0 0 20px",
            letterSpacing: "-0.015em",
            textShadow: "0 2px 20px rgba(0,0,0,0.2)",
          }}
        >
          Experience Goa<br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>from the water.</em>
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onMouseEnter={() => setBookHovered(true)}
            onMouseLeave={() => setBookHovered(false)}
            style={{
              padding: "13px 30px",
              background: bookHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.92)",
              color: "hsl(215 50% 23%)",
              border: "none",
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Reserve a Stay
          </button>

          <span
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.65)",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            Explore experiences →
          </span>
        </div>
      </div>

      {/* Bottom-right — single data point, nothing more */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          right: 52,
          zIndex: 10,
          textAlign: "right",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          From
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1,
          }}
        >
          ₹18,000
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>per night</div>
      </div>
    </div>
  );
}
