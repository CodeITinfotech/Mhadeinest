import "./tokens.css";
import { useState } from "react";

export function Editorial() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f4" }}>
      {/* Left panel — narrative */}
      <div
        className="flex flex-col justify-between"
        style={{
          width: "42%",
          background: "hsl(215 50% 23%)",
          padding: "48px 52px",
          color: "#fff",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Nav */}
        <div className="flex items-center gap-3">
          <img
            src="/__mockup/images/logo_transparent.png"
            alt="logo"
            style={{ width: 36, height: 36, objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, letterSpacing: "0.02em" }}>
            Mhadeinest
          </span>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32, paddingTop: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 1, background: "hsl(35 80% 55%)" }} />
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "hsl(35 80% 70%)", fontWeight: 500 }}>
              Goa Backwaters · Est. 2018
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
              color: "#fff",
              margin: 0,
            }}
          >
            Experience<br />
            Goa From<br />
            <em style={{ color: "hsl(35 80% 60%)", fontStyle: "italic" }}>The Water</em>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.70)", maxWidth: 300, margin: 0 }}>
            A luxury houseboat stay with 3 private bedrooms, rooftop dining, and thrilling water activities — 
            where the Mandovi meets the sea.
          </p>

          {/* Price + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
                Starting from
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 42,
                    fontWeight: 700,
                    color: "hsl(35 80% 60%)",
                    lineHeight: 1,
                  }}
                >
                  ₹18,000
                </span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>/night</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                  padding: "14px 28px",
                  background: hovered ? "hsl(35 80% 48%)" : "hsl(35 80% 55%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Book Your Stay
              </button>
              <button
                style={{
                  padding: "14px 24px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                }}
              >
                Explore →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom strip — availability */}
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "20px 0 0",
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Check-in", value: "Select date" },
            { label: "Guests", value: "2 adults" },
            { label: "Duration", value: "1 night" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 2, fontWeight: 500 }}>{value}</div>
            </div>
          ))}
          <button
            style={{
              marginLeft: "auto",
              padding: "8px 20px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "none",
              borderRadius: 3,
              fontSize: 12,
              cursor: "pointer",
              alignSelf: "flex-end",
            }}
          >
            Check →
          </button>
        </div>
      </div>

      {/* Right panel — image as content, not background */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <img
          src="/__mockup/images/hero.png"
          alt="Houseboat on Goa backwaters"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        {/* Subtle left-edge shadow to blend with panel */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 60,
            background: "linear-gradient(to right, hsl(215 50% 23% / 0.3), transparent)",
          }}
        />
        {/* Minimal tag */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            padding: "10px 16px",
            borderRadius: 4,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
            Mandovi River, Goa
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>MV Mhadeinest I</div>
        </div>
      </div>
    </div>
  );
}
