import operation from "../../_operations/firewall/ua-rules/create.js";
/**
 * create command
 * @generated from apis/overlays/firewall.ts
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
	command: "create",
	describe: "Create a User Agent Blocking rule",
	usage:
		"$0 firewall ua-rules create\n\nCreates a new User Agent Blocking rule in a zone.",
	flags: {
		"configuration-target": {
			kind: "parsed",
			brief:
				"The configuration target. You must set the target to `ua` when specifying a user agent in the rule.",
			optional: true,
			choices: ["ua"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "configuration-target", "text"),
		},
		"configuration-value": {
			kind: "parsed",
			brief: "the user agent to exactly match",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"An informative summary of the rule. This value is sanitized and any tags will be removed.",
			optional: true,
			parse: String,
		},
		"access-rule-mode": {
			kind: "parsed",
			brief: "The action to apply to a matched request.",
			optional: true,
			choices: [
				"block",
				"challenge",
				"whitelist",
				"js_challenge",
				"managed_challenge",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "access-rule-mode", "text"),
		},
		paused: {
			kind: "boolean",
			brief: "When true, indicates that the rule is currently paused.",
			optional: true,
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
				command: "firewall ua-rules create",
				classification: {
					safeFlags: [
						"configuration-target",
						"access-rule-mode",
						"paused",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["access-rule-mode"] === undefined) {
						argv["access-rule-mode"] = await promptForRequiredEnumField(
							"access-rule-mode",
							"The action to apply to a matched request.",
							[
								"block",
								"challenge",
								"whitelist",
								"js_challenge",
								"managed_challenge",
							] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf firewall ua-rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/ua_rules`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configuration: {
											target: argv["configuration-target"],
											value: resolveFileToken(
												argv["configuration-value"] as string | undefined,
												"configuration-value",
												"text"
											),
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										mode: argv["access-rule-mode"],
										paused: argv["paused"],
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
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					configuration: {
						target: argv["configuration-target"],
						value: resolveFileToken(
							argv["configuration-value"] as string | undefined,
							"configuration-value",
							"text"
						),
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					mode: argv["access-rule-mode"],
					paused: argv["paused"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
