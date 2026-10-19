import { printSuccess } from "../../lib/output.js";
import {
	getTelemetrySourceLabel,
	resolveTelemetry,
	setTelemetryPermission,
} from "../../lib/telemetry/config.js";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import type { CommandModule } from "yargs";

const command: CommandModule = {
	command: "enable",
	describe: "Enable cf telemetry collection",
	handler: () => {
		setTelemetryPermission(true);
		const { enabled, source } = resolveTelemetry();
		if (enabled) {
			printSuccess(
				"cf is now collecting anonymous usage telemetry. Thank you for helping make cf better."
			);
		} else {
			const override = `${getTelemetrySourceLabel(source)}${source === "env" || source === "wrangler-env" ? "=false" : ""}`;
			log.warn(
				`cf is not collecting usage telemetry because ${theme.code(override)} overrides this setting.`
			);
		}
	},
};

export default command;
