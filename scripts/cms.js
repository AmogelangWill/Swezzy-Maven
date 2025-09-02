// CMS.js — simplified version using publish-to-CSV link

const CMS_CONFIG = {
  // Direct link to your published sheet in CSV format
  SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnShLpqdGMWEby1DreBaPnqrX7gT3h1S9fcsug7vJCpSjdyb_k5hmZwaT91vvP5RiuW0d6ArbB5ATf/pub?output=csv"
};

async function fetchPosts() {
  try {
    const response = await fetch(CMS_CONFIG.SHEET_URL);
    const csvText = await response.text();

    // Convert CSV into objects
    const rows = csvText.split("\n").map(r => r.split(","));
    const headers = rows[0].map(h => h.trim());
    const posts = rows.slice(1).map(row => {
      let post = {};
      headers.forEach((h, i) => post[h] = row[i] ? row[i].trim() : "");
      return post;
    });

    return posts;
  } catch (err) {
    console.error("Failed to fetch posts from Google Sheets:", err);
    return [];
  }
}
