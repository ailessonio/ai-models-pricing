import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { LOCALES, normalizePayload, renderReadme, updateRepository } from "./update.mjs";

const payload = {
  data: [
    {
      id: "openai/example-pro",
      name: "Example Pro",
      created: 1_700_000_000,
      context_length: 128000,
      architecture: { input_modalities: ["text", "image"], output_modalities: ["text"] },
      pricing: { prompt: "0.0000015", completion: "0.000006" },
      top_provider: { max_completion_tokens: 8192 },
    },
    {
      id: "google/example-free",
      name: "Example Free",
      created: 1_600_000_000,
      context_length: 32000,
      architecture: { input_modalities: ["text"], output_modalities: ["text"] },
      pricing: { prompt: "0", completion: "0" },
      top_provider: {},
    },
    { id: "invalid", name: "Invalid", pricing: { prompt: "free", completion: "0" } },
  ],
};

function response() {
  return Promise.resolve({ ok: true, json: async () => payload });
}

test("normalizes API data and renders only paid models", () => {
  const models = normalizePayload(payload);
  assert.equal(models.length, 2);
  const markdown = renderReadme("en", {
    updatedAt: "2026-09-18T00:00:00.000Z",
    models,
  });
  assert.match(markdown, /AI Models Pricing — LLM API Price List/);
  assert.match(markdown, /\[Example Pro\]\(https:\/\/ailesson\.io\/llm-price\/model\/openai-example-pro\)/);
  assert.match(markdown, /\$1\.50 \| \$6\.00 \| 128,000/);
  assert.doesNotMatch(markdown, /Example Free/);
  const tableLines = markdown.split("\n").filter((line) => line.startsWith("|"));
  assert.equal(tableLines.length, 3);
  assert.ok(tableLines.every((line) => line.split("|").length === 9));
});

test("writes ten localized READMEs and avoids time-only changes", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-models-pricing-test-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const first = await updateRepository({
    root,
    fetchImpl: response,
    now: new Date("2026-09-18T00:00:00.000Z"),
  });
  assert.equal(first.changed.length, 11);
  assert.equal(LOCALES.length, 10);
  const second = await updateRepository({
    root,
    fetchImpl: response,
    now: new Date("2026-09-19T00:00:00.000Z"),
  });
  assert.deepEqual(second.changed, []);
  const snapshot = JSON.parse(await readFile(path.join(root, "data", "models.json"), "utf8"));
  assert.equal(snapshot.updatedAt, "2026-09-18T00:00:00.000Z");
  assert.equal(snapshot.modelCount, 2);
  assert.equal(snapshot.paidModelCount, 1);
});

test("rejects an empty or invalid API payload", () => {
  assert.throws(() => normalizePayload({ data: [] }), /no valid model pricing/);
  assert.throws(() => normalizePayload({ data: [{ id: "bad", name: "Bad", pricing: {} }] }), /no valid model pricing/);
});
