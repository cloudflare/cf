import {
	resolveTelemetry,
	TELEMETRY_ENV_VAR,
} from "../../lib/telemetry/config.js";
import { theme } from "../../lib/ui/index.js";
import { TELEMETRY_DOCS_URL, telemetryStatusLine } from "./shared.js";
import type { CommandModule } from "yargs";

const command: CommandModule = {
	command: "status",
	describe: "Check whether cf telemetry collection is enabled",
	handler: () => {
		console.log(telemetryStatusLine(resolveTelemetry()));
		console.log(
			theme.muted(
				"Configure on this machine: `cf cli telemetry enable` / `cf cli telemetry disable`.\n" +
					`Override per invocation with ${TELEMETRY_ENV_VAR}=true/false. DO_NOT_TRACK is also honored.\n` +
					`Learn more: ${TELEMETRY_DOCS_URL}`
			)
		);
	},
};

export default command;
