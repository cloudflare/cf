import operation from "../../../_operations/speed/pages/tests/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/speed.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 speed pages tests create <url>\n\nStarts a test for a specific webpage, in a specific region."
		)
		.positional("url", {
			type: "string",
			description: "A URL.",
			demandOption: true,
		})
		.option("region", {
			type: "string",
			description: "A test region.",
			choices: [
				"asia-east1",
				"asia-northeast1",
				"asia-northeast2",
				"asia-south1",
				"asia-southeast1",
				"australia-southeast1",
				"europe-north1",
				"europe-southwest1",
				"europe-west1",
				"europe-west2",
				"europe-west3",
				"europe-west4",
				"europe-west8",
				"europe-west9",
				"me-west1",
				"southamerica-east1",
				"us-central1",
				"us-east1",
				"us-east4",
				"us-south1",
				"us-west1",
			],
		})
		.coerce("region", (value) => resolveFileToken(value, "region", "text"))
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
	command: "create <url>",
	describe: "Start page test",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "speed pages tests create",
				classification: {
					safeFlags: ["region", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf speed pages tests create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/speed_api/pages/${argv["url"] == null ? "<url>" : encodeURIComponent(String(argv["url"]))}/tests`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							url: String(argv["url"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										region: argv["region"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							url: argv["url"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					region: argv["region"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						url: argv["url"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
