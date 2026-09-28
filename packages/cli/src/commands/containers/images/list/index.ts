import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { withTelemetry } from "#lib/telemetry/index.js";
import { listContainerImages } from "@cloudflare/containers-shared";
import { configureRegistryAccess } from "../context.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs.option("filter", {
		type: "string",
		description: "Regex to filter repository names",
	});
}
type Args = InferArgs<typeof builder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List images in the Cloudflare managed registry",
	builder,
	async handler(argv) {
		if (argv.local) {
			throw new Error(
				"--local is not supported with `cf containers images list`."
			);
		}
		// Reject invalid expressions before requesting credentials.
		if (argv.filter !== undefined) {
			new RegExp(argv.filter);
		}
		const context = await configureRegistryAccess();
		const images = await withProgress("Loading", () =>
			listContainerImages({ ...context, filter: argv.filter })
		);
		formatOutput(images, { quiet: argv.quiet });
	},
};
export default withTelemetry(command, {
	command: "containers images list",
	classification: { safeFlags: [] },
});
