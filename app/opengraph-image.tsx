import { ImageResponse } from "next/og";

/**
 * 공유 카드 이미지.
 *
 * <p>PWA 아이콘(512×512 정사각형)을 그대로 쓰고 있었는데, 카카오톡·슬랙의 카드 비율은
 * 1.91:1 이라 잘리거나 작게 보였다. 권장 규격으로 직접 그린다.
 *
 * <p>SVG 를 쓰지 않는다. 카카오톡은 SVG 를 카드 이미지로 받지 않는다.
 */
export const alt = "Berty — AI 생활금융 에이전트";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

// 앱 색상 토큰과 맞춘다 (app/globals.css).
const BACKGROUND = "#fcfcfc";
const ESPRESSO = "#301c1b";
const YELLOW = "#FFEB60";
const GRAYSCALE_700 = "#707070";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BACKGROUND,
          // 카드가 흰 배경 위에 놓일 때 경계가 사라지지 않게 한다.
          borderBottom: `16px solid ${YELLOW}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: 32,
              background: YELLOW,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 700,
              color: ESPRESSO,
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 700,
              color: ESPRESSO,
              letterSpacing: -2,
            }}
          >
            Berty
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            color: GRAYSCALE_700,
          }}
        >
          AI 생활금융 에이전트
        </div>
      </div>
    ),
    size,
  );
}
