import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { BridgeClient } from "./src/bridge-client.js";
import { registerKillSwitchCommand } from "./src/commands/kill-switch.js";
import { registerStatusCommand } from "./src/commands/status.js";
import {
  PolymarketTradingConfigSchema,
  type PolymarketTradingConfig,
} from "./src/config-schema.js";
import { registerMarketSearch } from "./src/tools/market-search.js";
import { registerPlaceOrder } from "./src/tools/place-order.js";
import { registerPnlReport } from "./src/tools/pnl-report.js";
import { registerRiskStatus } from "./src/tools/risk-status.js";
import { registerStrategyControl } from "./src/tools/strategy-control.js";
import { registerViewPositions } from "./src/tools/view-positions.js";

const polymarketTradingPlugin = {
  id: "polymarket-trading",
  name: "Polymarket Trading",
  description:
    "Bridge to Polymarket prediction market trading engine. Search markets, place orders, manage strategies, monitor risk and PnL.",
  configSchema: {
    parse(value: unknown): PolymarketTradingConfig {
      const raw =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};
      return PolymarketTradingConfigSchema.parse(raw);
    },
    uiHints: {
      engineUrl: {
        label: "Engine URL",
        help: "URL of the polymarket-bot HTTP server",
        placeholder: "http://localhost:18800",
      },
      apiToken: {
        label: "API Token",
        sensitive: true,
        help: "Bearer token for authenticating with the trading engine",
      },
    },
  },

  register(api: OpenClawPluginApi) {
    const config = PolymarketTradingConfigSchema.parse(api.pluginConfig ?? {});

    if (!config.enabled) {
      api.logger.info("[polymarket-trading] Plugin disabled in config");
      return;
    }

    if (!config.apiToken) {
      api.logger.warn(
        "[polymarket-trading] No apiToken configured — tools will fail until engine is accessible",
      );
    }

    const client = new BridgeClient(config.engineUrl, config.apiToken);

    const register = api.registerTool.bind(api);
    registerMarketSearch(register, client);
    registerPlaceOrder(register, client);
    registerViewPositions(register, client);
    registerStrategyControl(register, client);
    registerRiskStatus(register, client);
    registerPnlReport(register, client);

    if (api.registerCli) {
      const regCli = api.registerCli.bind(api);
      registerStatusCommand(regCli, client);
      registerKillSwitchCommand(regCli, client);
    }

    api.registerService({
      id: "polymarket-trading",
      async start() {
        const healthy = await client.health();
        if (healthy) {
          api.logger.info("[polymarket-trading] Connected to trading engine");
        } else {
          api.logger.warn(
            `[polymarket-trading] Engine not reachable at ${config.engineUrl} — will retry on tool calls`,
          );
        }
      },
      async stop() {
        api.logger.info("[polymarket-trading] Plugin stopped");
      },
    });
  },
};

export default polymarketTradingPlugin;
