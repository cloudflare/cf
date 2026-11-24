import operation from "../../_operations/zones/subscriptions/update.js";
/**
 * update command
 * @generated from apis/overlays/zones.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update Zone Subscription",
	usage:
		"$0 zones subscriptions update\n\nUpdates zone subscriptions, either plan or add-ons.",
	flags: {
		"app-install-id": {
			kind: "parsed",
			brief: "app install id.",
			optional: true,
			parse: String,
		},
		"component-values": {
			kind: "parsed",
			brief:
				'Configurable component values for the subscription. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"default"?: number, "display_name"?: string, "kind"?: "enum" | "sum" | "usage", "name"?: string, "price"?: number, ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		frequency: {
			kind: "parsed",
			brief: "How often the subscription is renewed automatically.",
			optional: true,
			choices: ["weekly", "monthly", "quarterly", "yearly"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "frequency", "text"),
		},
		"rate-plan-currency": {
			kind: "parsed",
			brief: "The currency applied to the rate plan subscription.",
			optional: true,
			parse: String,
		},
		"rate-plan-externally-managed": {
			kind: "boolean",
			brief: "Whether this rate plan is managed externally from Cloudflare.",
			optional: true,
		},
		"rate-plan-id": {
			kind: "parsed",
			brief: "The ID of the rate plan.",
			optional: true,
			parse: String,
		},
		"rate-plan-is-contract": {
			kind: "boolean",
			brief:
				"Whether a rate plan is enterprise-based (or newly adopted term contract).",
			optional: true,
		},
		"rate-plan-public-name": {
			kind: "parsed",
			brief: "The full name of the rate plan.",
			optional: true,
			parse: String,
		},
		"rate-plan-scope": {
			kind: "parsed",
			brief: "The scope that this rate plan applies to.",
			optional: true,
			parse: String,
		},
		"rate-plan-sets": {
			kind: "parsed",
			brief:
				"The list of sets this rate plan applies to. Returns array of strings.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones subscriptions update",
				classification: {
					safeFlags: [
						"frequency",
						"rate-plan-externally-managed",
						"rate-plan-is-contract",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones subscriptions update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/subscription`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										app: {
											install_id: resolveFileToken(
												argv["app-install-id"] as string | undefined,
												"app-install-id",
												"text"
											),
										},
										component_values: parseObjectArray(
											argv["component-values"],
											"component-values"
										),
										frequency: argv["frequency"],
										rate_plan: {
											currency: resolveFileToken(
												argv["rate-plan-currency"] as string | undefined,
												"rate-plan-currency",
												"text"
											),
											externally_managed: argv["rate-plan-externally-managed"],
											id: resolveFileToken(
												argv["rate-plan-id"] as string | undefined,
												"rate-plan-id",
												"text"
											),
											is_contract: argv["rate-plan-is-contract"],
											public_name: resolveFileToken(
												argv["rate-plan-public-name"] as string | undefined,
												"rate-plan-public-name",
												"text"
											),
											scope: resolveFileToken(
												argv["rate-plan-scope"] as string | undefined,
												"rate-plan-scope",
												"text"
											),
											sets: argv["rate-plan-sets"],
										},
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					app: {
						install_id: resolveFileToken(
							argv["app-install-id"] as string | undefined,
							"app-install-id",
							"text"
						),
					},
					component_values: parseObjectArray(
						argv["component-values"],
						"component-values"
					),
					frequency: argv["frequency"],
					rate_plan: {
						currency: resolveFileToken(
							argv["rate-plan-currency"] as string | undefined,
							"rate-plan-currency",
							"text"
						),
						externally_managed: argv["rate-plan-externally-managed"],
						id: resolveFileToken(
							argv["rate-plan-id"] as string | undefined,
							"rate-plan-id",
							"text"
						),
						is_contract: argv["rate-plan-is-contract"],
						public_name: resolveFileToken(
							argv["rate-plan-public-name"] as string | undefined,
							"rate-plan-public-name",
							"text"
						),
						scope: resolveFileToken(
							argv["rate-plan-scope"] as string | undefined,
							"rate-plan-scope",
							"text"
						),
						sets: argv["rate-plan-sets"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
