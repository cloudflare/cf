import operation from "../_operations/content-scan/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/content-scan.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete, promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 content-scan update\n\nUpdate the Content Scanning status by setting the status value to `enabled` or `disabled`. This is equivalent to calling the dedicated enable and disable endpoints."
		)
		.option("value", {
			type: "string",
			description: "The status value for Content Scanning.",
			choices: ["enabled", "disabled"],
		})
		.coerce("value", (value) => resolveFileToken(value, "value", "text"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Content Scanning settings to update.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update the Content Scanning status for a zone.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "content-scan update",
				classification: {
					safeFlags: ["value", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf content-scan update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/content-upload-scan/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: argv["value"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation toggles Content Scanning for a zone.`,
					}))
				) {
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredEnumField(
						"value",
						"The status value for Content Scanning.",
						["enabled", "disabled"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					value: argv["value"],
				});
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
