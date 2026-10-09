import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/web-assets.ts
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
			"$0 web-assets discovery operations edit <discovery-id>\n\nUpdates the state of a discovered web or API operation."
		)
		.positional("discovery-id", {
			type: "string",
			description: "Discovery ID of a discovered operation",
			demandOption: true,
		})
		.option("state", {
			type: "string",
			description:
				"Mark state of operation in API Discovery\n  * `review` - Mark operation as for review\n  * `ignored` - Mark operation as ignored\n",
			choices: ["review", "ignored"],
		})
		.coerce("state", (value) => resolveFileToken(value, "state", "text"))
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

type Request = SdkRequest<"api-shield-api-patch-discovered-operation">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <discovery-id>",
	describe: "Edit a discovered web or API operation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets discovery operations edit",
				classification: {
					safeFlags: ["state", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets discovery operations edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/discovery/operations/${argv["discovery-id"] == null ? "<discovery-id>" : encodeURIComponent(String(argv["discovery-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"discovery-id": String(argv["discovery-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										state: argv["state"],
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.webAssets.discovery.operations.edit({
							...bodyData,
							zone_id: zoneId,
							discovery_id: argv["discovery-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					state: argv["state"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.webAssets.discovery.operations.edit({
						...bodyData,
						zone_id: zoneId,
						discovery_id: argv["discovery-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
