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
	command: "disable",
	describe: "Disable cf telemetry collection",
	handler: () => {
		setTelemetryPermission(false);
		const { enabled, source } = resolveTelemetry();
		if (enabled) {
			const override = `${getTelemetrySourceLabel(source)}=true`;
			log.warn(
				`cf is collecting usage telemetry because ${theme.code(override)} overrides this setting.`
			);
		} else {
			printSuccess("cf is no longer collecting usage telemetry.");
		}
	},
};

export default command;
