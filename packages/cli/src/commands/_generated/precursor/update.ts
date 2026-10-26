import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/precursor.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 precursor update\n\nUpdates the Precursor configuration for a zone. `mode` controls whether Precursor detection is off, monitoring, or armed. `show_interstitial` controls the zone-level response when armed. `rules` is the ordered list of overrides for matching requests. This is a partial update: only the fields present in the request body are changed. - Sending an empty array (`[]`) clears all rules. - At least one of `mode`, `show_interstitial`, or `rules` must be present; an empty body (`{}`) is rejected with `400`. - Rule `id` is read-only (assigned by Cloudflare) and ignored on input. - Rule `show_interstitial` is required and controls the response for requests that match that rule. - Rule `expression` is limited to 4000 characters. The limit applies to each rule individually, not to the combined size of all rules."
		)
		.option("cloudflare-version", {
			type: "string",
			description: "Selects the split Precursor API schema.",
			demandOption: true,
		})
		.option("rules", {
			type: "string",
			description:
				"The ordered list of Precursor rules for the zone. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("show-interstitial", {
			type: "boolean",
			description:
				"Whether Precursor shows an interstitial when it takes action on a\nrequest.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zone Precursor Config",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "precursor update",
				classification: {
					safeFlags: ["show-interstitial", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cloudflare-version"] !== undefined)
					headers["Cloudflare-Version"] = String(argv["cloudflare-version"]);
				if (argv.dryRun) {
					formatDryRun({
						command: "cf precursor update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/precursor`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										rules: parseObjectArray(argv["rules"], "rules"),
										show_interstitial: argv["show-interstitial"],
										cloudflare_version: argv["cloudflare-version"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/zones/${argv.zoneId}/precursor`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["rules"] !== undefined)
					setNestedValue(
						bodyData,
						["rules"],
						parseObjectArray(argv["rules"], "rules")
					);
				if (argv["show-interstitial"] !== undefined)
					setNestedValue(
						bodyData,
						["show_interstitial"],
						argv["show-interstitial"]
					);
				if (argv["cloudflare-version"] !== undefined)
					bodyData["cloudflare_version"] = argv["cloudflare-version"];
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/zones/${argv.zoneId}/precursor`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
