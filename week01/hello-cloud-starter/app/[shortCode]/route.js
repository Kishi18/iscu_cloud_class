import { findUrlByShortCode } from "../../lib/db";

export async function GET(request, { params }) {
  const { shortCode } = await params;

  const originalUrl = await findUrlByShortCode(shortCode);

  const requestId = `req_${Math.random().toString(36).substring(2, 9)}`;

  // TODO
  // originalUrl이 존재하지 않는 경우
  // 404 Not Found 응답을 반환하세요.
  if (!originalUrl) {
    console.warn("Short URL not found", { shortCode });

    return new Response("Not Found", {
      status: 404 
    });
  }

  //클릭 기록과 로그 추가
  try {
    await recordClick(shortCode);
  } catch (error) {    
    console.error(
      JSON.stringify({
        event: "click_update_failed",
        requestId,
        shortCode,
        errorName: error.name,
        errorMessage: error.message,
      })
    );
  }

  console.log(
    JSON.stringify({
      event: "redirect_completed",
      requestId,
      shortCode,
      status: 307,
    })
  );

  return new Response(null, {
    status: 307,
    headers: {
      Location: originalUrl,
      "Cache-Control": "no-store",
    },
  });
}