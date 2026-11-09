import { findUrlByShortCode } from "../../lib/db";
import { recordClick } from "../../lib/stats";

export async function GET(request, { params }) {
  const { shortCode } = await params;
  const requestId = `req_${crypto.randomUUID().slice(0, 8)}`;
  const startTime = Date.now();

  try{
    const originalUrl = await findUrlByShortCode(shortCode);
    
    // TODO
    // originalUrl이 존재하지 않는 경우
    // 404 Not Found 응답을 반환하세요.
    if (!originalUrl) {
      console.warn(
        JSON.stringify({
          event: "short_code_not_found",
          requestId,
          shortCode,
          status: 404,
          durationMs: Date.now() - startTime,
        })
      );

      return new Response("Not Found", {
        status: 404 
      });
    }
  
    try {
      await recordClick(shortCode);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "click_update_failed",
          requestId,
          shortCode,
          errorMessage: error?.message || "Click record failed",
        })
      );
    }

    console.info(
      JSON.stringify({
        event: "redirect_completed",
        requestId,
        shortCode,
        status: 307,
        durationMs: Date.now() - startTime,
      })
    );
    
    return new Response(null, {
      status: 307,
      headers: {
        Location: originalUrl,
        "Cache-Control": "no-store",
      },
    });
  } catch(error) {
    console.error(
      JSON.stringify({
        event: "redirect_system_error",
        requestId,
        shortCode,
        errorMessage: error?.message || "Internal server error",
      })
    );

    return new Response("Internal Server Error", {
      status: 500,
    });
  }
  

}