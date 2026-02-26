import { Type } from "@sinclair/typebox";
import type { BridgeClient } from "../bridge-client.js";

export const ViewPositionsSchema = Type.Object({
  status: Type.Optional(
    Type.Union([Type.Literal("open"), Type.Literal("closed")], {
      description: "Filter by position status",
    }),
  ),
  market: Type.Optional(Type.String({ description: "Filter by market condition ID" })),
});

export function registerViewPositions(registerTool: (opts: unknown) => void, client: BridgeClient) {
  registerTool({
    name: "polymarket_positions",
    description:
      "View current Polymarket trading positions. Shows market, entry price, current price, unrealized PnL, and status.",
    parameters: ViewPositionsSchema,
    async execute(_toolCallId: string, params: { status?: "open" | "closed"; market?: string }) {
      const query: Record<string, string> = {};
      if (params.status) query.status = params.status;
      if (params.market) query.market = params.market;
      const data = await client.get("/api/v1/positions", query);
      return { success: true, data };
    },
  });
}
