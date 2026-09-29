import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 security-insights partners shadow-hosts list\n\nLists partner-discovered hosts beneath the zone that are not in the account."
		)
		.option("partner", {
			type: "string",
			description: "The partner integration identifier.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Page number for premium partner asset results.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of premium partner asset results per page. Values other than 1 must be a multiple of 5.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Lists Partner-Discovered Shadow Hosts for a Zone",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-insights partners shadow-hosts list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf security-insights partners shadow-hosts list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/security-center/partners/${argv["partner"] == null ? "<partner>" : encodeURIComponent(String(argv["partner"]))}/shadow-hosts`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							partner: String(argv["partner"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(
						`/zones/${argv.zoneId}/security-center/partners/${encodeURIComponent(String(argv["partner"]))}/shadow-hosts${qs ? "?" + qs : ""}`,
						{
							method: "GET",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
						}
					)
				);
				writeRawOutput(__cfRawBytes.toString("utf-8"));
				return;
			}
		),
};

export default command;
