import operation from "../../_operations/waiting-rooms/rules/edit.js";
/**
 * edit command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <rule-id>",
	describe: "Patch Waiting Room Rule",
	usage:
		"$0 waiting-rooms rules edit <rule-id>\n\nPatches a rule for a waiting room.",
	flags: {
		"waiting-room-id": {
			kind: "parsed",
			brief: "Waiting room ID",
			parse: String,
		},
		action: {
			kind: "parsed",
			brief: "The action to take when the expression matches.",
			optional: true,
			choices: ["bypass_waiting_room"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		description: {
			kind: "parsed",
			brief: "The description of the rule.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "When set to true, the rule is enabled.",
			optional: true,
		},
		expression: {
			kind: "parsed",
			brief: "Criteria defining when there is a match for the current rule.",
			optional: true,
			parse: String,
		},
		"position-index": {
			kind: "parsed",
			brief:
				"Places the rule in the exact position specified by the integer number <POSITION_NUMBER>. Position numbers start with 1. Existing rules in the ruleset from the specified position number onward are shifted one position (no rule is overwritten).",
			optional: true,
			parse: Number,
		},
		"position-before": {
			kind: "parsed",
			brief:
				'Places the rule before rule <RULE_ID>. Use this argument with an empty rule ID value ("") to set the rule as the first rule in the ruleset.',
			optional: true,
			parse: String,
		},
		"position-after": {
			kind: "parsed",
			brief:
				'Places the rule after rule <RULE_ID>. Use this argument with an empty rule ID value ("") to set the rule as the last rule in the ruleset.',
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
	operands: [
		{ placeholder: "rule-id", brief: "The ID of the rule.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms rules edit",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action"] === undefined) {
						argv["action"] = await promptForRequiredEnumField(
							"action",
							"The action to take when the expression matches.",
							["bypass_waiting_room"] as const
						);
					}
					if (argv["expression"] === undefined) {
						argv["expression"] = await promptForRequiredField(
							"expression",
							"Criteria defining when there is a match for the current rule."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf waiting-rooms rules edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
							"rule-id": String(argv["rule-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
										position: {
											index: argv["position-index"],
											before: resolveFileToken(
												argv["position-before"] as string | undefined,
												"position-before",
												"text"
											),
											after: resolveFileToken(
												argv["position-after"] as string | undefined,
												"position-after",
												"text"
											),
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
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							waiting_room_id: argv["waiting-room-id"],
							rule_id: argv["rule-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					action: argv["action"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
					position: {
						index: argv["position-index"],
						before: resolveFileToken(
							argv["position-before"] as string | undefined,
							"position-before",
							"text"
						),
						after: resolveFileToken(
							argv["position-after"] as string | undefined,
							"position-after",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
