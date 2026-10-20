import { withTelemetry } from "../../lib/telemetry/index.js";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import loginCommand, { loginTelemetryClassification } from "../auth/login.js";

/**
 * Hidden compatibility alias for users accustomed to `wrangler login`.
 * The command metadata intentionally stays under `cf auth login`.
 */
const loginAliasCommand: typeof loginCommand = {
	...loginCommand,
	describe: false,
	handler: async (argv) => {
		if (!argv.quiet) {
			log.info(
				`${theme.code("cf login")} is an alias for ${theme.code("cf auth login")}. Authentication commands are under ${theme.code("cf auth")}.`
			);
		}
		await loginCommand.handler(argv);
	},
};

export default withTelemetry(loginAliasCommand, {
	command: "login",
	classification: loginTelemetryClassification,
});
