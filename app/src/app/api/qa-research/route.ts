// Mock-only QA research route (F5-04 / M1). Thin wrapper: the pipeline
// lives in lib/qa-research/route-handler.ts because Next.js route
// modules may only export route fields. Serves SYNTHETIC data only.

import { createQaResearchHandler } from "../../../lib/qa-research/route-handler";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const handler = createQaResearchHandler();
  return handler(req);
}
