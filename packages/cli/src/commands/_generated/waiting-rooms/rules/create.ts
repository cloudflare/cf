import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
			"$0 waiting-rooms rules create <waiting-room-id>\n\nOnly available for the Waiting Room Advanced subscription. Creates a rule for a waiting room."
		)
		.positional("waiting-room-id", {
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
			default: "",
		})
		.option("enabled", {
			type: "boolean",
			description: "When set to true, the rule is enabled.",
			default: true,
		})
		.option("expression", {
			type: "string",
			description:
				"Criteria defining when there is a match for the current rule.",
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

type Request = SdkRequest<"waiting-room-create-waiting-room-rule">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <waiting-room-id>",
	describe: "Create Waiting Room Rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms rules create",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/rules`,
						pathParams: {
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.waitingRooms.rules.create({
							body: bodyData,
							zone_id: zoneId,
							waiting_room_id: argv["waiting-room-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.waitingRooms.rules.create({
						body: bodyData,
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
