import operation from "../../_operations/pay-per-use/pricing/set-operator-price.js";
/**
 * set-operator-price command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "set-operator-price <operator-id>",
	describe: "Set a pay-per-use operator price",
	usage:
		"$0 pay-per-use pricing set-operator-price <operator-id>\n\nProposes a required price, withdraws a pending proposal, accepts an operator's default pay-per-use price, or resumes an accepted price before its scheduled expiry. Propose, accept_default, and resume require an enabled operator with a verified name, an enabled publisher zone, and matching billing classifications.",
	flags: {
		action: {
			kind: "parsed",
			brief: "The action field",
			optional: true,
			choices: ["propose", "withdraw", "accept_default", "resume"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		"price-usd-microcents": {
			kind: "parsed",
			brief:
				"Price in microcents. Must be a multiple of 100,000 ($0.001) between $0.001 and $9,999.999.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Pay-per-use publisher price action",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "operator-id",
			brief: "Stable pay-per-use operator identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use pricing set-operator-price",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action"] === undefined) {
						argv["action"] = await promptForRequiredEnumField(
							"action",
							"The action field",
							["propose", "withdraw", "accept_default", "resume"] as const
						);
					}

					if (
						argv["action"] === "propose" &&
						argv["price-usd-microcents"] === undefined
					) {
						throw new Error(
							"--price-usd-microcents is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf pay-per-use pricing set-operator-price",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pay-per-use/operators/${argv["operator-id"] == null ? "<operator-id>" : encodeURIComponent(String(argv["operator-id"]))}/price`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"operator-id": String(argv["operator-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										price_usd_microcents: argv["price-usd-microcents"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							operator_id: argv["operator-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					action: argv["action"],
					price_usd_microcents: argv["price-usd-microcents"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						operator_id: argv["operator-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
