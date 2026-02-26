import type { BridgeClient } from "../bridge-client.js";

export function registerStatusCommand(
  registerCli: (fn: (program: unknown) => void) => void,
  client: BridgeClient,
) {
  registerCli((program: any) => {
    program
      .command("polymarket-status")
      .description("Show Polymarket trading engine status")
      .action(async () => {
        try {
          const healthy = await client.health();
          if (!healthy) {
            console.log("Engine: OFFLINE (not reachable at configured URL)");
            return;
          }

          const risk = await client.get<{
            success: boolean;
            data: { state: Record<string, unknown>; limits: Record<string, unknown> };
          }>("/api/v1/risk");

          const strategies = await client.get<{
            success: boolean;
            data: { data: Array<{ id: string; name: string; active: boolean }> };
          }>("/api/v1/strategies");

          const pnl = await client.get<{
            success: boolean;
            data: { current: Record<string, unknown> };
          }>("/api/v1/pnl");

          console.log("Engine: ONLINE");
          console.log("\nRisk State:", JSON.stringify(risk.data?.state ?? risk, null, 2));
          console.log(
            "\nStrategies:",
            JSON.stringify(strategies.data?.data ?? strategies, null, 2),
          );
          console.log("\nPnL:", JSON.stringify(pnl.data?.current ?? pnl, null, 2));
        } catch (err) {
          console.error("Error:", err instanceof Error ? err.message : err);
        }
      });
  });
}
