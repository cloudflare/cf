import {
	getTelemetrySourceLabel,
	resolveTelemetry,
	setTelemetryPermission,
} from "../../lib/telemetry/config.js";
import { telemetryStatusLine } from "./shared.js";
import type { CommandModule } from "yargs";

const command: CommandModule = {
	command: "enable",
	describe: "Enable cf telemetry collection",
	handler: () => {
		setTelemetryPermission(true);
		const { enabled, source } = resolveTelemetry();
		console.log(telemetryStatusLine({ enabled, source }));
		console.log(
			enabled
				? "cf is now collecting anonymous usage telemetry. Thank you for helping make cf better.\n"
				: `cf is not collecting usage telemetry because ${getTelemetrySourceLabel(source)}${source === "env" || source === "wrangler-env" ? "=false" : ""} overrides this setting.\n`
		);
	},
};

export default command;
