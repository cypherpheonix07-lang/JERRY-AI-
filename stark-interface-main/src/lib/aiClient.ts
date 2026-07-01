// AI client — calls Claude (Anthropic) or OpenAI directly from the browser using user's keys.
// Falls back to a local echo if no key/model is configured.

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type ModelChoice = "claude" | "openai" | "local";

const SYSTEM = "You are J.A.R.V.I.S — Tony Stark's calm, witty, ultra-competent AI assistant. Address the user as 'sir'. Keep replies concise unless detail is requested.";

export const getModel = (): ModelChoice =>
  (localStorage.getItem("jarvis-model") as ModelChoice) || "local";

export async function chat(history: ChatMsg[]): Promise<string> {
  const model = getModel();
  const claudeKey = localStorage.getItem("jarvis-claude") || "";
  const openaiKey = localStorage.getItem("jarvis-openai") || "";

  if (model === "claude" && claudeKey) return claudeCall(claudeKey, history);
  if (model === "openai" && openaiKey) return openaiCall(openaiKey, history);
  return localBrain(history);
}

async function claudeCall(key: string, history: ChatMsg[]): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM,
      messages: history.map(m => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.content?.[0]?.text ?? "I have no response, sir.";
}

async function openaiCall(key: string, history: ChatMsg[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM }, ...history],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "I have no response, sir.";
}

function localBrain(history: ChatMsg[]): Promise<string> {
  const q = history[history.length - 1]?.content?.toLowerCase() || "";
  let out = `Acknowledged. Configure a Claude or OpenAI API key in Settings to engage my full neural cortex, sir.`;
  if (q.includes("time")) out = `It is currently ${new Date().toLocaleTimeString()}.`;
  else if (q.includes("hello") || q.includes("hi ")) out = "Greetings, sir. All systems are nominal.";
  else if (q.includes("who are you")) out = "I am J.A.R.V.I.S — Just A Rather Very Intelligent System.";
  return Promise.resolve(out);
}
