import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/precursor.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 precursor get\n\nRetrieve a zone's Precursor configuration: the detection `mode`, whether to `show_interstitial`, and the ordered list of `rules`."
		)
		.option("cloudflare-version", {
			type: "string",
			description: "Selects the split Precursor API schema.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get Zone Precursor Config",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "precursor get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cloudflare-version"] !== undefined)
					headers["Cloudflare-Version"] = String(argv["cloudflare-version"]);
				if (argv.dryRun) {
					formatDryRun({
						command: "cf precursor get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/precursor`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"GET",
						`/zones/${argv.zoneId}/precursor`,
						{ headers: Object.keys(headers).length > 0 ? headers : undefined }
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
