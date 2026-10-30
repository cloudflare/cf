import { runUpload, sharedUploadBuilder } from "./shared.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return sharedUploadBuilder(yargs)
		.option("durable-objects-code-update-mode", {
			description:
				"When active Durable Objects adopt new code (default: deferred)",
			choices: ["immediate", "deferred"] as const,
			requiresArg: true,
		})
		.option("durable-objects-code-update-max-delay", {
			description:
				"Maximum deferred update delay in seconds (default: 300, maximum: 86400)",
			type: "number",
			requiresArg: true,
		})
		.check((argv) => {
			const delay = argv["durable-objects-code-update-max-delay"];
			if (delay !== undefined) {
				if (argv["durable-objects-code-update-mode"] !== "deferred") {
					throw new Error(
						"--durable-objects-code-update-max-delay requires --durable-objects-code-update-mode deferred"
					);
				}
				if (
					!Number.isFinite(delay) ||
					delay < 0 ||
					delay > 86400 ||
					Math.abs(delay * 1000 - Math.round(delay * 1000)) >= 1e-6
				) {
					throw new Error(
						"--durable-objects-code-update-max-delay must be between 0 and 86400 seconds with at most millisecond precision"
					);
				}
			}
			return true;
		})
		.option("provision", {
			type: "boolean",
			description:
				"Automatically provision resources for bindings that need them",
			default: true,
		})
		.option("dispatch-namespace", {
			type: "string",
			description:
				"Name of a dispatch namespace to deploy the Worker to (Workers for Platforms)",
			requiresArg: true,
		})
		.option("containers-rollout", {
			description:
				"Rollout strategy for Container changes. Immediate rolls out to all instances in one step; none leaves deployed Containers unchanged.",
			choices: ["immediate", "gradual", "none"] as const,
		});
}

export type DeployArgs = InferArgs<typeof builder>;

const deployCommand: CommandModule<CommonYargsOptions, DeployArgs> = {
	command: "deploy",
	describe:
		"Deploy a Worker, static site, or full-stack application to Cloudflare",
	builder,
	handler: async (argv) => {
		await runUpload(argv, { command: "Deploy" });
	},
};

export default deployCommand;
