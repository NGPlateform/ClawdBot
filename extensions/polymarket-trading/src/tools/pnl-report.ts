import { Type } from "@sinclair/typebox";
import type { BridgeClient } from "../bridge-client.js";

export const PnlReportSchema = Type.Object({
  view: Type.Optional(
    Type.Union([Type.Literal("summary"), Type.Literal("history")], {
      description: "View type: summary (current PnL) or history (snapshots over time)",
      default: "summary",
    }),
  ),
  limit: Type.Optional(Type.Number({ description: "Max history entries", default: 50 })),
});

export function registerPnlReport(registerTool: (opts: unknown) => void, client: BridgeClient) {
  registerTool({
    name: "polymarket_pnl",
    description:
      "View Polymarket trading PnL (profit & loss). Shows realized/unrealized PnL, total exposure, win rate, and historical snapshots.",
    parameters: PnlReportSchema,
    async execute(_toolCallId: string, params: { view?: "summary" | "history"; limit?: number }) {
      if (params.view === "history") {
        return {
          success: true,
          data: await client.get("/api/v1/pnl/history", {
            limit: String(params.limit ?? 50),
          }),
        };
      }
      return { success: true, data: await client.get("/api/v1/pnl") };
    },
  });
}
