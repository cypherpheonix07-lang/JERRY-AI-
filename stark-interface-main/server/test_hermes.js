(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/hermes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args: ['--help'] })
    });
    const txt = await res.text();
    console.log('HERMES RESPONSE:\n', txt);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
