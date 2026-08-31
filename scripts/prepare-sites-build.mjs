import { mkdir, writeFile } from "node:fs/promises";

const worker = `const INDEX_PATH = "/index.html";

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || request.method !== "GET") {
      return response;
    }

    const fallbackUrl = new URL(request.url);
    fallbackUrl.pathname = INDEX_PATH;
    fallbackUrl.search = "";

    return env.ASSETS.fetch(new Request(fallbackUrl, request));
  },
};
`;

await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", worker);
