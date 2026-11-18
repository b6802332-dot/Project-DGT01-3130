const BASE = process.env.BASE || "http://192.168.56.201";

async function check(path) {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`[OK] ${url} -> Status: ${res.status} (${text.length} bytes)`);
  } catch (err) {
    console.error(`[FAIL] ${url} -> ${err.message}`);
  }
}

console.log(`Checking Gateway at ${BASE}...`);
await check("/");
await check("/api/health");
