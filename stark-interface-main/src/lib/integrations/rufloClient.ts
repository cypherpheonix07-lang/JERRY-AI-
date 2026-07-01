export async function runRuflo(args: string[] = ['--help']) {
  const res = await fetch('/api/ruflo', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args })
  });
  return res.json();
}
