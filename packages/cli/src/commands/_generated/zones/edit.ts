import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
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
			"$0 zones edit\n\nEdits a zone. Only one zone property can be changed at a time."
		)
		.option("paused", {
			type: "boolean",
			description:
				"Indicates whether the zone is only using Cloudflare DNS services. A\ntrue value means the zone will not receive security or performance\nbenefits.\n",
		})
		.option("plan-id", { type: "string", description: "Identifier" })
		.option("type", {
			type: "string",
			description:
				"A full zone implies that DNS is hosted with Cloudflare. A partial\nzone is typically a partner-hosted zone or a CNAME setup. This\nparameter is only available to Enterprise customers or if it has\nbeen explicitly enabled on a zone.\n",
			choices: ["full", "partial", "secondary", "internal"],
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("vanity-name-servers", {
			type: "string",
			array: true,
			description:
				"An array of domains used for custom name servers. This is only\navailable for Business and Enterprise plans.",
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

type Request = SdkRequest<"zones-0-patch">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Edit Zone",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones edit",
				classification: {
					safeFlags: ["paused", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										paused: argv["paused"],
										plan: {
											id: resolveFileToken(
												argv["plan-id"] as string | undefined,
												"plan-id",
												"text"
											),
										},
										type: argv["type"],
										vanity_name_servers: argv["vanity-name-servers"],
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
						client.zones.edit({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					paused: argv["paused"],
					plan: {
						id: resolveFileToken(
							argv["plan-id"] as string | undefined,
							"plan-id",
							"text"
						),
					},
					type: argv["type"],
					vanity_name_servers: argv["vanity-name-servers"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zones.edit({ ...bodyData, zone_id: zoneId } satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
