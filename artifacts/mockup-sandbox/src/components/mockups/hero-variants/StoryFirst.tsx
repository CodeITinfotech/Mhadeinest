import "./tokens.css";
import { useState, useEffect } from "react";

const MOMENTS = [
  {
    time: "5:45 AM",
    headline: "Mist rises off the\nGoa backwaters.",
    sub: "Your morning begins in silence, on water.",
    image: "/__mockup/images/hero.png",
    accent: "hsl(200 70% 70%)",
  },
  {
    time: "12:30 PM",
    headline: "Kayaking under\nan open sky.",
    sub: "The Mandovi stretches wide. It's all yours.",
    image: "/__mockup/images/about.png",
    accent: "hsl(35 80% 65%)",
  },
  {
    time: "8:00 PM",
    headline: "Dinner under\na thousand stars.",
    sub: "Rooftop. Goan cuisine. The river below.",
    image: "/__mockup/images/bedroom.png",
    accent: "hsl(35 60% 55%)",
  },
];

const MOMENT_DURATION = 3200;

export function StoryFirst() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [storyDone, setStoryDone] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [bookHovered, setBookHovered] = useState(false);

  useEffect(() => {
    if (storyDone) return;

    const timer = setTimeout(() => {
      if (current < MOMENTS.length - 1) {
        setVisible(false);
        setTimeout(() => {
          setCurrent((c) => c + 1);
          setVisible(true);
        }, 500);
      } else {
        setTimeout(() => {
          setStoryDone(true);
          setTimeout(() => setCtaVisible(true), 400);
        }, 600);
      }
    }, MOMENT_DURATION);

    return () => clearTimeout(timer);
  }, [current, storyDone]);

  const moment = MOMENTS[current];

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
      {/* Background images with crossfade */}
      {MOMENTS.map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            transition: "opacity 0.9s ease",
            opacity: i === current ? 1 : 0,
            zIndex: 0,
          }}
        >
          <img
            src={m.image}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </div>
      ))}

      {/* Deep overlay — story needs legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.55) 100%)",
          zIndex: 1,
        }}
      />

      {/* Logo — top left */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
        }}
      >
        <img
          src="/__mockup/images/logo_transparent.png"
          alt="logo"
          style={{ width: 30, height: 30, objectFit: "contain", filter: "brightness(0) invert(1)" }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17,
            color: "rgba(255,255,255,0.9)",
            fontWeight: 600,
          }}
        >
          Mhadeinest
        </span>
      </div>

      {/* Story content — center-left */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          textAlign: "center",
          width: "90%",
          maxWidth: 640,
        }}
      >
        {!storyDone ? (
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            {/* Time stamp */}
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: moment.accent,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div style={{ width: 20, height: 1, background: moment.accent }} />
              {moment.time}
              <div style={{ width: 20, height: 1, background: moment.accent }} />
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 56,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.12,
                margin: "0 0 18px",
                letterSpacing: "-0.01em",
                whiteSpace: "pre-line",
              }}
            >
              {moment.headline}
            </h1>

            {/* Sub */}
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.62)",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              {moment.sub}
            </p>
          </div>
        ) : (
          /* Final CTA — appears after story */
          <div
            style={{
              opacity: ctaVisible ? 1 : 0,
              transform: ctaVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "hsl(35 80% 65%)",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div style={{ width: 20, height: 1, background: "hsl(35 80% 55%)" }} />
              Goa · India
              <div style={{ width: 20, height: 1, background: "hsl(35 80% 55%)" }} />
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 52,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.12,
                margin: "0 0 12px",
              }}
            >
              Your escape,<br />
              <em style={{ fontStyle: "italic", fontWeight: 400, color: "hsl(35 80% 65%)" }}>crafted for you.</em>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 32 }}>
              Three nights. Three bedrooms. One river. All of Goa.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <button
                onMouseEnter={() => setBookHovered(true)}
                onMouseLeave={() => setBookHovered(false)}
                style={{
                  padding: "15px 36px",
                  background: bookHovered ? "hsl(35 80% 48%)" : "hsl(35 80% 55%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 3,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Book Your Stay
              </button>
              <button
                style={{
                  padding: "15px 28px",
                  background: "transparent",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 3,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                See Packages
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress dots — bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          zIndex: 10,
          alignItems: "center",
        }}
      >
        {MOMENTS.map((_, i) => (
          <div
            key={i}
            onClick={() => { setCurrent(i); setVisible(true); setStoryDone(false); setCtaVisible(false); }}
            style={{
              width: i === current && !storyDone ? 24 : 7,
              height: 7,
              borderRadius: 4,
              background: i === current && !storyDone
                ? "hsl(35 80% 55%)"
                : "rgba(255,255,255,0.35)",
              cursor: "pointer",
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
        {storyDone && (
          <div
            style={{
              width: 24,
              height: 7,
              borderRadius: 4,
              background: "hsl(35 80% 55%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
