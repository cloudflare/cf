import operation from "../../../_operations/radar/bgp/routes/moas.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * moas command
 * @generated from apis/overlays/radar.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 radar bgp routes moas\n\nRetrieves all Multi-Origin AS (MOAS) prefixes in the global routing tables."
		)
		.option("origin", {
			type: "number",
			description: "Lookup MOASes originated by the given ASN.",
		})
		.option("prefix", { type: "string", description: "Prefix" })
		.option("invalid-only", {
			type: "boolean",
			description: "Lookup only RPKI invalid MOASes.",
		})
		.option("format", {
			type: "string",
			description: "Format in which results will be returned.",
			choices: ["JSON", "CSV"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "moas",
	describe: "Get Multi-Origin AS (MOAS) prefixes",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp routes moas",
				classification: {
					safeFlags: ["invalid-only", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					origin: argv["origin"],
					prefix: argv["prefix"],
					invalid_only: argv["invalid-only"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes moas",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/moas`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
