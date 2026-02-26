import type { BridgeClient } from "../bridge-client.js";

export function registerKillSwitchCommand(
  registerCli: (fn: (program: unknown) => void) => void,
  client: BridgeClient,
) {
  registerCli((program: any) => {
    program
      .command("polymarket-kill")
      .description("Activate Polymarket trading kill switch (emergency stop)")
      .option("--deactivate", "Deactivate the kill switch instead")
      .option("--reason <reason>", "Reason for activating", "Manual kill switch via CLI")
      .action(async (opts: { deactivate?: boolean; reason?: string }) => {
        try {
          const healthy = await client.health();
          if (!healthy) {
            console.error("Engine is not reachable");
            return;
          }

          if (opts.deactivate) {
            await client.del("/kill-switch");
            console.log("Kill switch DEACTIVATED");
          } else {
            await client.post("/kill-switch", {
              reason: opts.reason ?? "Manual kill switch via CLI",
            });
            console.log("Kill switch ACTIVATED — all trading halted");
          }
        } catch (err) {
          console.error("Error:", err instanceof Error ? err.message : err);
        }
      });
  });
}
