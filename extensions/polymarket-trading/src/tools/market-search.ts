import { Type } from "@sinclair/typebox";
import type { BridgeClient } from "../bridge-client.js";

export const MarketSearchSchema = Type.Object({
  query: Type.String({
    description: "Search query for Polymarket markets (e.g. 'bitcoin', 'election')",
  }),
  active: Type.Optional(Type.Boolean({ description: "Filter active markets only", default: true })),
  limit: Type.Optional(Type.Number({ description: "Max results", default: 10 })),
});

export function registerMarketSearch(registerTool: (opts: unknown) => void, client: BridgeClient) {
  registerTool({
    name: "polymarket_search",
    description:
      "Search Polymarket prediction markets by keyword. Returns market questions, current prices/probabilities, volume, and liquidity.",
    parameters: MarketSearchSchema,
    async execute(
      _toolCallId: string,
      params: { query: string; active?: boolean; limit?: number },
    ) {
      const data = await client.get("/api/v1/markets", {
        query: params.query,
        active: String(params.active ?? true),
        limit: String(params.limit ?? 10),
      });
      return { success: true, data };
    },
  });
}
