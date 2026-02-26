import { Type } from "@sinclair/typebox";
import type { BridgeClient } from "../bridge-client.js";

export const PlaceOrderSchema = Type.Object({
  marketId: Type.String({ description: "Polymarket condition ID" }),
  tokenId: Type.String({ description: "Token ID (YES or NO outcome token)" }),
  side: Type.Union([Type.Literal("BUY"), Type.Literal("SELL")], {
    description: "Order side",
  }),
  price: Type.Number({ description: "Price between 0.01 and 0.99", minimum: 0.01, maximum: 0.99 }),
  size: Type.Number({ description: "Number of shares", minimum: 0.01 }),
  orderType: Type.Optional(
    Type.Union([Type.Literal("GTC"), Type.Literal("GTD"), Type.Literal("FOK")], {
      description: "Order type (default: GTC)",
    }),
  ),
});

export function registerPlaceOrder(registerTool: (opts: unknown) => void, client: BridgeClient) {
  registerTool({
    name: "polymarket_order",
    description:
      "Place a trade order on Polymarket. Buys or sells outcome shares at a specified price. Risk checks are applied automatically.",
    parameters: PlaceOrderSchema,
    async execute(
      _toolCallId: string,
      params: {
        marketId: string;
        tokenId: string;
        side: "BUY" | "SELL";
        price: number;
        size: number;
        orderType?: "GTC" | "GTD" | "FOK";
      },
    ) {
      const data = await client.post("/api/v1/orders", {
        marketId: params.marketId,
        tokenId: params.tokenId,
        side: params.side,
        price: params.price,
        size: params.size,
        orderType: params.orderType ?? "GTC",
      });
      return { success: true, data };
    },
  });
}
