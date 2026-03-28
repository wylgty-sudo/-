export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return Response.json({ error: 'Missing url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()

    const getTag = (property: string): string | null => {
      const match =
        html.match(new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'))
      return match?.[1] ?? null
    }

    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]

    return Response.json({
      title: getTag('title') ?? titleTag ?? url,
      description: getTag('description'),
      image: getTag('image'),
    })
  } catch {
    return Response.json({ title: url, description: null, image: null })
  }
}
