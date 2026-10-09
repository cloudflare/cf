import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 waiting-rooms rules edit <rule-id>\n\nPatches a rule for a waiting room."
		)
		.positional("rule-id", {
			type: "string",
			description: "The ID of the rule.",
			demandOption: true,
		})
		.option("waiting-room-id", {
			type: "string",
			description: "Waiting room ID",
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description: "The action to take when the expression matches.",
			choices: ["bypass_waiting_room"],
		})
		.coerce("action", (value: string | undefined) =>
			resolveFileToken(value, "action", "text")
		)
		.option("description", {
			type: "string",
			description: "The description of the rule.",
		})
		.option("enabled", {
			type: "boolean",
			description: "When set to true, the rule is enabled.",
		})
		.option("expression", {
			type: "string",
			description:
				"Criteria defining when there is a match for the current rule.",
		})
		.option("position-index", {
			type: "number",
			description:
				"Places the rule in the exact position specified by the integer number <POSITION_NUMBER>. Position numbers start with 1. Existing rules in the ruleset from the specified position number onward are shifted one position (no rule is overwritten).",
		})
		.option("position-before", {
			type: "string",
			description:
				'Places the rule before rule <RULE_ID>. Use this argument with an empty rule ID value ("") to set the rule as the first rule in the ruleset.',
		})
		.option("position-after", {
			type: "string",
			description:
				'Places the rule after rule <RULE_ID>. Use this argument with an empty rule ID value ("") to set the rule as the last rule in the ruleset.',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("position-index", ["position-before", "position-after"])
		.conflicts("position-before", ["position-index", "position-after"])
		.conflicts("position-after", ["position-index", "position-before"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"waiting-room-patch-waiting-room-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <rule-id>",
	describe: "Patch Waiting Room Rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms rules edit",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms rules edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: {
							"rule-id": String(argv["rule-id"] ?? ""),
							"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.waitingRooms.rules.edit({
							...bodyData,
							zone_id: zoneId,
							waiting_room_id: argv["waiting-room-id"],
							rule_id: argv["rule-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.waitingRooms.rules.edit({
						...bodyData,
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
						rule_id: argv["rule-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
