import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/bot-management.ts
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
			"$0 bot-management feedback create\n\nSubmit a feedback report for the specified zone. Use `type` to indicate whether the report is a false positive (good traffic flagged as bot) or a false negative (bot traffic missed). Furthermore, you can also use `expression` as a wirefilter to identify the affected traffic sample. See more accepted API fields and expression types at https://developers.cloudflare.com/bots/concepts/feedback-loop/#api-fields and https://developers.cloudflare.com/bots/concepts/feedback-loop/#expression-fields, respectively."
		)
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("expression", {
			type: "string",
			description:
				"Wirefilter expression describing the traffic being reported.",
		})
		.option("first-request-seen-at", {
			type: "string",
			description: "The first_request_seen_at field",
		})
		.option("last-request-seen-at", {
			type: "string",
			description: "The last_request_seen_at field",
		})
		.option("requests", { type: "number", description: "The requests field" })
		.option("subtype", { type: "string", description: "The subtype field" })
		.option("type", {
			type: "string",
			description: "Type of feedback report.",
			choices: ["false_positive", "false_negative"],
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
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

type Request = SdkRequest<"bot-management-zone-feedback-create">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Submit a feedback report",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "bot-management feedback create",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf bot-management feedback create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/bot_management/feedback`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
										first_request_seen_at: resolveFileToken(
											argv["first-request-seen-at"] as string | undefined,
											"first-request-seen-at",
											"text"
										),
										last_request_seen_at: resolveFileToken(
											argv["last-request-seen-at"] as string | undefined,
											"last-request-seen-at",
											"text"
										),
										requests: argv["requests"],
										subtype: resolveFileToken(
											argv["subtype"] as string | undefined,
											"subtype",
											"text"
										),
										type: argv["type"],
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
						client.botManagement.feedback.create({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"The description field"
					);
				}
				if (argv["expression"] === undefined) {
					argv["expression"] = await promptForRequiredField(
						"expression",
						"Wirefilter expression describing the traffic being reported."
					);
				}
				if (argv["first-request-seen-at"] === undefined) {
					argv["first-request-seen-at"] = await promptForRequiredField(
						"first-request-seen-at",
						"The first_request_seen_at field"
					);
				}
				if (argv["last-request-seen-at"] === undefined) {
					argv["last-request-seen-at"] = await promptForRequiredField(
						"last-request-seen-at",
						"The last_request_seen_at field"
					);
				}
				if (argv["requests"] === undefined) {
					throw new Error(
						"--requests is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Type of feedback report.",
						["false_positive", "false_negative"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
					first_request_seen_at: resolveFileToken(
						argv["first-request-seen-at"] as string | undefined,
						"first-request-seen-at",
						"text"
					),
					last_request_seen_at: resolveFileToken(
						argv["last-request-seen-at"] as string | undefined,
						"last-request-seen-at",
						"text"
					),
					requests: argv["requests"],
					subtype: resolveFileToken(
						argv["subtype"] as string | undefined,
						"subtype",
						"text"
					),
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.botManagement.feedback.create({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
