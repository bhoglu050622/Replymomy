import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "THE MIDNIGHT GUILD";
  const subtitle =
    searchParams.get("subtitle") ?? "Where Exceptional Finds Exceptional";

  // Load Cormorant Garamond from Google Fonts CDN — fallback gracefully if unreachable
  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await fetch(
      "https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.woff",
      { signal: AbortSignal.timeout(4000) }
    ).then((r) => r.arrayBuffer());
  } catch {
    // Font CDN unreachable — render with system sans-serif
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A0A0E 50%, #0A0A0A 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Burgundy blob — top-left */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(74,14,26,0.4) 0%, transparent 70%)",
          }}
        />

        {/* Champagne bloom — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)",
          }}
        />

        {/* Inset border frame */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        />

        {/* Content stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Diamond ornament */}
          <div
            style={{
              fontSize: 36,
              color: "#C9A84C",
              marginBottom: 20,
              lineHeight: 1,
            }}
          >
            ✦
          </div>

          {/* Separator */}
          <div
            style={{
              width: 120,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #C9A84C, transparent)",
              marginBottom: 32,
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontFamily: fontData ? "Cormorant Garamond" : "serif",
              fontWeight: 300,
              color: "#C9A84C",
              letterSpacing: "0.22em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            {title}
          </div>

          {/* Separator */}
          <div
            style={{
              width: 120,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #C9A84C, transparent)",
              marginTop: 28,
              marginBottom: 24,
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              fontFamily: fontData ? "Cormorant Garamond" : "serif",
              fontStyle: "italic",
              color: "rgba(245,240,232,0.65)",
              textAlign: "center",
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 40,
              fontSize: 12,
              fontFamily: "sans-serif",
              color: "rgba(245,240,232,0.3)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Invitation Only · replymommy.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [
            {
              name: "Cormorant Garamond",
              data: fontData,
              style: "normal",
              weight: 300,
            },
          ]
        : [],
    }
  );
}
