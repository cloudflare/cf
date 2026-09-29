import { withTelemetry } from "../../../../lib/telemetry/index.js";
import { runUpload, sharedUploadBuilder } from "../../../deploy/shared.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return sharedUploadBuilder(yargs)
		.hide("local")
		.hide("persist-to")
		.epilogue("Local simulation (--local) is not supported by this command.")
		.option("preview-alias", {
			type: "string",
			description: "Preview alias for this Worker Version",
			requiresArg: true,
		});
}

type VersionsCreateArgs = InferArgs<typeof builder>;

const versionsCreateCommand: CommandModule<
	CommonYargsOptions,
	VersionsCreateArgs
> = {
	command: "create",
	describe: "Upload a new Worker Version without deploying it",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error(
				"--local is not supported by cf workers versions create."
			);
		}

		await runUpload(argv, {
			command: "Version upload",
		});
	},
};

export default withTelemetry(versionsCreateCommand, {
	command: "workers versions create",
	classification: { safeFlags: ["dry-run", "prebuilt"] },
});
