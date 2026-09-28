import { withTelemetry } from "../../lib/telemetry/index.js";
import { info, theme } from "../../lib/ui/index.js";
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
			console.error(
				info(
					`${theme.code("cf login")} is an alias for ${theme.code("cf auth login")}. Authentication commands are under ${theme.code("cf auth")}.`
				)
			);
		}
		await loginCommand.handler(argv);
	},
};

export default withTelemetry(loginAliasCommand, {
	command: "login",
	classification: loginTelemetryClassification,
});
