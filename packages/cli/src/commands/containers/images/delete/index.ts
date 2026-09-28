import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { withTelemetry } from "#lib/telemetry/index.js";
import { warning } from "#lib/ui/format.js";
import {
	deleteContainerImage,
	parseContainerImageTag,
} from "@cloudflare/containers-shared";
import { configureRegistryAccess } from "../context.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("image", {
			type: "string",
			demandOption: true,
			description: "Image and tag to delete, of the form IMAGE:TAG",
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			default: false,
			description: "Skip the deletion confirmation prompt",
		});
}
type Args = InferArgs<typeof builder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <image>",
	describe: "Delete an image tag from the Cloudflare managed registry",
	builder,
	async handler(argv) {
		if (argv.local) {
			throw new Error(
				"--local is not supported with `cf containers images delete`."
			);
		}
		parseContainerImageTag(argv.image);
		if (
			!(await confirmDelete({
				force: argv.force,
				message: `Delete ${argv.image}? This action cannot be undone.`,
			}))
		) {
			return;
		}
		const context = await configureRegistryAccess();
		const result = await withProgress("Deleting", () =>
			deleteContainerImage({ ...context, image: argv.image })
		);
		formatOutput({ image: argv.image, ...result }, { quiet: argv.quiet });
		if (result.warning) {
			console.warn(warning(result.warning));
		}
	},
};
export default withTelemetry(command, {
	command: "containers images delete",
	classification: {
		safeFlags: ["force"],
		shortFlagAliases: {
			f: { canonical: "force", type: "boolean" },
		},
	},
});
