import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LoveHub Birthdays - One Page. Every Wish, Kept in One Place.";
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDF4E7",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Top Kicker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "rgba(14, 107, 94, 0.12)",
            padding: "8px 20px",
            borderRadius: "30px",
            marginBottom: "28px",
          }}
        >
          <div style={{ fontSize: 22 }}>🎂</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0E6B5E",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            LoveHub Birthdays
          </div>
        </div>

        {/* Big Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#14231F",
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "960px",
            marginBottom: "24px",
          }}
        >
          One page. Every wish, kept in one place.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#55655F",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Set up a birthday surprise page with friends and family. Group wishes, photos, and notes unlock on the day.
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#E85025",
              color: "#FFFFFF",
              padding: "12px 28px",
              borderRadius: "50px",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Create a birthday page
          </div>
          <div
            style={{
              backgroundColor: "#CDEBE0",
              color: "#0E6B5E",
              padding: "12px 24px",
              borderRadius: "50px",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            lovehub.in/birthdays
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
