// Sends a commoner's biography brief to an OpenAI-compatible chat server (llama-server's /v1)
// with a style's system prompt, and returns the written text.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLES_FILE = path.join(__dirname, '../../data/random/biography/styles.json');

// Override with LLM_BASE_URL in .env (must end at /v1)
const baseUrl = () => (process.env.LLM_BASE_URL || 'http://192.168.1.170:2345/v1').replace(/\/+$/, '');

// Read fresh each call so prompt edits apply without restarting the server
export const loadStyles = () => {
  const { styles = [] } = JSON.parse(fs.readFileSync(STYLES_FILE, 'utf8'));
  return styles;
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

export const writeBiography = async ({ style: styleKey, brief }) => {
  if (!brief || typeof brief !== 'string') throw httpError(400, 'A biography brief is required');
  const style = loadStyles().find(s => s.key === styleKey);
  if (!style) throw httpError(400, `Unknown biography style: ${styleKey}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180000);
  let response;
  try {
    response = await fetch(`${baseUrl()}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: style.system },
          { role: 'user', content: brief }
        ],
        temperature: style.temperature ?? 0.8,
        max_tokens: style.maxTokens ?? 512,
        stream: false
      })
    });
  } catch (err) {
    throw httpError(502, err.name === 'AbortError'
      ? 'The AI server took too long to answer'
      : `Could not reach the AI server at ${baseUrl()} (${err.cause?.code || err.message})`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw httpError(502, `AI server error ${response.status}: ${text.slice(0, 300)}`);
  }
  const data = await response.json();
  const choice = data.choices?.[0];
  // Strip any reasoning block a thinking model emits despite reasoning being off
  const text = (choice?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  if (!text) throw httpError(502, 'The AI server returned an empty answer');

  return {
    style: style.key,
    text,
    truncated: choice?.finish_reason === 'length',
    model: data.model,
    usage: data.usage
  };
};
