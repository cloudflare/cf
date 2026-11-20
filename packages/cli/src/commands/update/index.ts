import { valid } from "semver";
import {
	findOwnPackageJson,
	isEphemeralExecInstall,
} from "../../lib/delegate.js";
import { formatOutput, printSuccess } from "../../lib/output.js";
import { isReleaseTag, planUpdate, runUpdate } from "./install.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("target", {
			type: "string",
			default: "latest",
			description: "Release tag or exact version to install",
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: "Show the package manager command without running it",
		});
}

const updateCommand: CommandModule<
	CommonYargsOptions,
	InferArgs<typeof builder>
> = {
	command: "update [target]",
	describe: "Update the current installation of cf",
	builder,
	handler: async (args) => {
		const version = valid(args.target);
		if (!version && !isReleaseTag(args.target)) {
			throw new Error(
				"Specify a release tag or an exact version, such as latest or 1.2.3."
			);
		}
		const manifest = findOwnPackageJson();
		if (!manifest || isEphemeralExecInstall(manifest)) {
			throw new Error(
				"There is no persistent cf installation to update. For one-shot runs, use your package manager to run cf with a release tag or version, such as npx cf@latest."
			);
		}
		const plan = await planUpdate(
			process.cwd(),
			manifest,
			version ?? args.target
		);
		if (args["dry-run"]) {
			formatOutput({ dryRun: true, ...plan });
			return;
		}
		await runUpdate(plan);
		printSuccess("Updated cf");
	},
};

export default updateCommand;
