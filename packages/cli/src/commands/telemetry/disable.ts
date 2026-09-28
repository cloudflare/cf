import {
	getTelemetrySourceLabel,
	resolveTelemetry,
	setTelemetryPermission,
} from "../../lib/telemetry/config.js";
import { telemetryStatusLine } from "./shared.js";
import type { CommandModule } from "yargs";

const command: CommandModule = {
	command: "disable",
	describe: "Disable cf telemetry collection",
	handler: () => {
		setTelemetryPermission(false);
		const { enabled, source } = resolveTelemetry();
		console.log(telemetryStatusLine({ enabled, source }));
		console.log(
			enabled
				? `cf is collecting usage telemetry because ${getTelemetrySourceLabel(source)}=true overrides this setting.\n`
				: "cf is no longer collecting usage telemetry.\n"
		);
	},
};

export default command;
