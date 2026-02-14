export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BonsAI/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return res.status(200).json({ error: `HTTP ${response.status}`, content: "" });
    }

    const html = await response.text();

    // Extract useful information from HTML
    const extract = (regex, fallback = "") => {
      const m = html.match(regex);
      return m ? m[1].trim() : fallback;
    };

    const title = extract(/<title[^>]*>([\s\S]*?)<\/title>/i);

    // Meta descriptions and keywords
    const metaDesc = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i)
      || extract(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i);
    const ogDesc = extract(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']/i)
      || extract(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+property=["']og:description["']/i);
    const ogTitle = extract(/<meta[^>]+property=["']og:title["'][^>]+content=["']([\s\S]*?)["']/i)
      || extract(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+property=["']og:title["']/i);
    const keywords = extract(/<meta[^>]+name=["']keywords["'][^>]+content=["']([\s\S]*?)["']/i)
      || extract(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']keywords["']/i);

    // Strip tags and get body text
    let bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, " [HEADER] ")
      .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n## $1\n")
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Limit to ~4000 chars to keep prompt size manageable
    if (bodyText.length > 4000) {
      bodyText = bodyText.slice(0, 4000) + "...";
    }

    // Extract headings for structure overview
    const headings = [];
    const hRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
    let hMatch;
    while ((hMatch = hRegex.exec(html)) !== null && headings.length < 20) {
      const text = hMatch[1].replace(/<[^>]+>/g, "").trim();
      if (text) headings.push(text);
    }

    // Extract links for CTA candidates
    const links = [];
    const aRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let aMatch;
    while ((aMatch = aRegex.exec(html)) !== null && links.length < 15) {
      const text = aMatch[2].replace(/<[^>]+>/g, "").trim();
      const href = aMatch[1];
      if (text && href && !href.startsWith("#") && !href.startsWith("javascript:") && text.length < 50) {
        links.push({ text, href });
      }
    }

    return res.status(200).json({
      url,
      title,
      ogTitle,
      metaDescription: metaDesc,
      ogDescription: ogDesc,
      keywords,
      headings,
      links,
      bodyText,
    });
  } catch (e) {
    return res.status(200).json({
      url,
      error: e.message,
      content: "",
    });
  }
}
