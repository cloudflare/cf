import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
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
			"$0 zero-trust dlp email rules update <rule-id>\n\nUpdates a DLP email scanning rule."
		)
		.positional("rule-id", {
			type: "string",
			description: "Rule ID",
			demandOption: true,
		})
		.option("action-action", {
			type: "string",
			description: "The action.action field",
			choices: ["Block"],
		})
		.coerce("action-action", (value: string | undefined) =>
			resolveFileToken(value, "action-action", "text")
		)
		.option("action-message", {
			type: "string",
			description: "The action.message field",
		})
		.option("conditions", {
			type: "string",
			description:
				"Triggered if all conditions match. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("name", { type: "string", description: "The name field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Rule description.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-email-scanner-update-rule">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <rule-id>",
	describe: "Update email scanner rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp email rules update",
				classification: {
					safeFlags: ["action-action", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp email rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: {
											action: argv["action-action"],
											message: resolveFileToken(
												argv["action-message"] as string | undefined,
												"action-message",
												"text"
											),
										},
										conditions: parseObjectArray(
											argv["conditions"],
											"conditions"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.dlp.email.rules.update({
							body: bodyData,
							account_id: accountId,
							rule_id: argv["rule-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["action-action"] === undefined) {
					argv["action-action"] = await promptForRequiredEnumField(
						"action-action",
						"The action.action field",
						["Block"] as const
					);
				}
				if (argv["conditions"] === undefined) {
					throw new Error(
						"--conditions is required (or pass --body with this field set)."
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: {
						action: argv["action-action"],
						message: resolveFileToken(
							argv["action-message"] as string | undefined,
							"action-message",
							"text"
						),
					},
					conditions: parseObjectArray(argv["conditions"], "conditions"),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.dlp.email.rules.update({
						body: bodyData,
						account_id: accountId,
						rule_id: argv["rule-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
