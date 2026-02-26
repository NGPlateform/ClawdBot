import { Type } from "@sinclair/typebox";
import type { BridgeClient } from "../bridge-client.js";

export const RiskStatusSchema = Type.Object({
  action: Type.Optional(
    Type.Union([Type.Literal("view"), Type.Literal("update_limits")], {
      description: "View risk state or update limits",
      default: "view",
    }),
  ),
  limits: Type.Optional(
    Type.Object(
      {
        maxPositionSizeUsd: Type.Optional(Type.Number()),
        maxTotalExposureUsd: Type.Optional(Type.Number()),
        maxDrawdownPercent: Type.Optional(Type.Number()),
      },
      { description: "New risk limits (only for update_limits action)" },
    ),
  ),
});

export function registerRiskStatus(registerTool: (opts: unknown) => void, client: BridgeClient) {
  registerTool({
    name: "polymarket_risk",
    description:
      "View or update Polymarket trading risk management. Shows current exposure, drawdown, kill switch status, and position limits.",
    parameters: RiskStatusSchema,
    async execute(
      _toolCallId: string,
      params: {
        action?: "view" | "update_limits";
        limits?: Record<string, number>;
      },
    ) {
      if (params.action === "update_limits" && params.limits) {
        return {
          success: true,
          data: await client.patch("/api/v1/risk/limits", params.limits),
        };
      }
      return { success: true, data: await client.get("/api/v1/risk") };
    },
  });
}
