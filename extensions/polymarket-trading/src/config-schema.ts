import { z } from "zod";

export const PolymarketTradingConfigSchema = z.object({
  enabled: z.boolean().default(true),
  engineUrl: z.string().url().default("http://localhost:18800"),
  apiToken: z.string().min(1).default(""),
});

export type PolymarketTradingConfig = z.infer<typeof PolymarketTradingConfigSchema>;
