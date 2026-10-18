import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LoveHub - Interactive Proposal & Keepsake Generator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#160611",
          backgroundImage: "radial-gradient(circle at 25% 40%, #500724 0%, #160611 75%)",
          padding: "60px 80px",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "700px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#f43f5e",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                border: "1px solid rgba(244, 63, 94, 0.4)",
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(244, 63, 94, 0.1)",
              }}
            >
              LOVEHUB.IN • PROPOSALS &amp; WISHBOARDS
            </span>
          </div>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.1,
              margin: "0 0 20px 0",
              color: "#ffffff",
            }}
          >
            Make Them Say Yes.
          </h1>
          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.4,
              color: "#e2e8f0",
              margin: "0 0 32px 0",
            }}
          >
            Design personal proposal websites with couple photos, ambient music, AI love notes, and the interactive runaway &apos;No&apos; button.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#fecdd3",
              }}
            >
              Rs. 31 One-Time
            </span>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#fecdd3",
              }}
            >
              Permanent Link
            </span>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#fecdd3",
              }}
            >
              Mobile Optimized
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(225, 29, 72, 0.3) 0%, rgba(225, 29, 72, 0) 70%)",
          }}
        >
          <div
            style={{
              fontSize: "140px",
            }}
          >
            💖
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
