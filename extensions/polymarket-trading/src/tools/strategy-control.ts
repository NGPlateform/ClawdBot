import { Type } from "@sinclair/typebox";
import type { BridgeClient } from "../bridge-client.js";

export const StrategyControlSchema = Type.Object({
  action: Type.Union(
    [
      Type.Literal("list"),
      Type.Literal("start"),
      Type.Literal("stop"),
      Type.Literal("update_config"),
    ],
    { description: "Strategy action" },
  ),
  strategyId: Type.Optional(
    Type.String({ description: "Strategy ID (required for start/stop/update)" }),
  ),
  config: Type.Optional(
    Type.Unknown({ description: "Strategy configuration (for start or update)" }),
  ),
});

export function registerStrategyControl(
  registerTool: (opts: unknown) => void,
  client: BridgeClient,
) {
  registerTool({
    name: "polymarket_strategy",
    description:
      "Control Polymarket trading strategies. List, start, stop strategies, or update their configuration. Available strategies: market-maker, arbitrage.",
    parameters: StrategyControlSchema,
    async execute(
      _toolCallId: string,
      params: {
        action: "list" | "start" | "stop" | "update_config";
        strategyId?: string;
        config?: unknown;
      },
    ) {
      switch (params.action) {
        case "list":
          return { success: true, data: await client.get("/api/v1/strategies") };

        case "start": {
          if (!params.strategyId) {
            return { success: false, error: "strategyId required for start" };
          }
          return {
            success: true,
            data: await client.post(
              `/api/v1/strategies/${params.strategyId}/start`,
              params.config ? { config: params.config } : undefined,
            ),
          };
        }

        case "stop": {
          if (!params.strategyId) {
            return { success: false, error: "strategyId required for stop" };
          }
          return {
            success: true,
            data: await client.post(`/api/v1/strategies/${params.strategyId}/stop`),
          };
        }

        case "update_config": {
          if (!params.strategyId) {
            return { success: false, error: "strategyId required for update" };
          }
          return {
            success: true,
            data: await client.patch(`/api/v1/strategies/${params.strategyId}/config`, {
              config: params.config,
            }),
          };
        }
      }
    },
  });
}
