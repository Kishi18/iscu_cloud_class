import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function saveUrl(shortCode, originalUrl) {
  await sql`
    INSERT INTO urls (short_code, original_url)
    VALUES (${shortCode}, ${originalUrl})
  `;
}

export async function findUrlByShortCode(shortCode) {
  const rows = await sql`
    SELECT original_url
    FROM urls
    WHERE short_code = ${shortCode}
    LIMIT 1
  `;

  return rows[0]?.original_url ?? null;
}

// T05 중복 URL 조회를 위해 추가된 함수
export async function findUrlByOriginalUrl(originalUrl) {
  const rows = await sql`
    SELECT short_code, original_url
    FROM urls
    WHERE original_url = ${originalUrl}
    LIMIT 1
  `;

  return rows[0] ?? null;
}