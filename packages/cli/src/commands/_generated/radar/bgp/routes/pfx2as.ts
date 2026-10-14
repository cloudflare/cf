import operation from "../../../_operations/radar/bgp/routes/pfx2as.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * pfx2as command
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
			"$0 radar bgp routes pfx2as\n\nRetrieves the prefix-to-ASN mapping from global routing tables."
		)
		.option("prefix", { type: "string", description: "Prefix" })
		.option("origin", {
			type: "number",
			description: "Lookup prefixes originated by the given ASN.",
		})
		.option("rpki-status", {
			type: "string",
			description:
				"Return only results with matching rpki status: valid, invalid or unknown.",
			choices: ["VALID", "INVALID", "UNKNOWN"],
		})
		.option("longest-prefix-match", {
			type: "boolean",
			description:
				"Return only results with the longest prefix match for the given prefix. For example, specify a /32 prefix to lookup the origin ASN for an IPv4 address.",
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
	command: "pfx2as",
	describe: "Get prefix-to-ASN mapping",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "radar bgp routes pfx2as",
				classification: {
					safeFlags: [
						"rpki-status",
						"longest-prefix-match",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					prefix: argv["prefix"],
					origin: argv["origin"],
					rpkiStatus: argv["rpki-status"],
					longestPrefixMatch: argv["longest-prefix-match"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf radar bgp routes pfx2as",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/pfx2as`,
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
