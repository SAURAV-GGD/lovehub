import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LoveHub - Create Magical Proposal Websites with AI";
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
          backgroundColor: "#fff1f2",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #fecdd3 2%, transparent 0%), radial-gradient(circle at 75px 75px, #ffe4e6 2%, transparent 0%)",
          backgroundSize: "100px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 90,
            height: 90,
            borderRadius: "50%",
            backgroundColor: "#f43f5e",
            color: "white",
            fontSize: 48,
            marginBottom: 24,
            boxShadow: "0 10px 25px rgba(244, 63, 94, 0.3)",
          }}
        >
          ❤️
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#881337",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          LoveHub
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "#9f1239",
            maxWidth: 800,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Create Magical, Personalized AI Proposal Websites For Your Love
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            padding: "12px 28px",
            borderRadius: 9999,
            backgroundColor: "#f43f5e",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          lovehub.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
