export async function runHermes(args: string[] = ['--help']) {
  const res = await fetch('/api/hermes', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args })
  });
  return res.json();
}
