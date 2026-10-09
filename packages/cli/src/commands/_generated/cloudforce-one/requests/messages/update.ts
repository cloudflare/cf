import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
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
			"$0 cloudforce-one requests messages update <message-id>\n\nUpdates an existing message, typically to publish a draft by setting publish=true. Workflow-enabled publication requires Idempotency-Key and atomically records message activity and any policy transition."
		)
		.positional("message-id", {
			type: "string",
			description: "Message ID",
			demandOption: true,
		})
		.option("project-type", {
			type: "string",
			description: "Project type",
			demandOption: true,
		})
		.option("request-id", {
			type: "string",
			description: "Request ID",
			demandOption: true,
		})
		.option("idempotency-key", {
			type: "string",
			description:
				"Client command key. Required when publishing a message for a workflow-enabled project; trimmed and limited to 255 characters.",
		})
		.option("attachment-asset-ids", {
			type: "string",
			array: true,
			description: "The attachment_asset_ids field",
		})
		.option("content", { type: "string", description: "The content field" })
		.option("publish", { type: "boolean", description: "The publish field" })
		.option("tlp", {
			type: "string",
			description: "The tlp field",
			choices: ["clear", "green", "amber", "amber-strict", "red", "white"],
		})
		.coerce("tlp", (value) => resolveFileToken(value, "tlp", "text"))
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <message-id>",
	describe: "Update/publish a message for an RFI request",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests messages update",
				classification: {
					safeFlags: ["publish", "tlp", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["idempotency-key"] !== undefined)
					headers["Idempotency-Key"] = String(argv["idempotency-key"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests messages update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/messages/${argv["message-id"] == null ? "<message-id>" : encodeURIComponent(String(argv["message-id"]))}`,
						pathParams: {
							"project-type": String(argv["project-type"] ?? ""),
							"request-id": String(argv["request-id"] ?? ""),
							"message-id": String(argv["message-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										attachment_asset_ids: argv["attachment-asset-ids"],
										content: resolveFileToken(
											argv["content"] as string | undefined,
											"content",
											"text"
										),
										publish: argv["publish"],
										tlp: argv["tlp"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/cloudforce-one/v2/requests/${encodeURIComponent(String(argv["project-type"]))}/${encodeURIComponent(String(argv["request-id"]))}/messages/${encodeURIComponent(String(argv["message-id"]))}`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["content"] === undefined) {
					argv["content"] = await promptForRequiredField(
						"content",
						"The content field"
					);
				}
				if (argv["publish"] === undefined) {
					throw new Error(
						"--publish is required (or pass --body with this field set)."
					);
				}
				if (argv["tlp"] === undefined) {
					argv["tlp"] = await promptForRequiredEnumField(
						"tlp",
						"The tlp field",
						["clear", "green", "amber", "amber-strict", "red", "white"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["attachment-asset-ids"] !== undefined)
					setNestedValue(
						bodyData,
						["attachment_asset_ids"],
						argv["attachment-asset-ids"]
					);
				if (argv["content"] !== undefined)
					setNestedValue(
						bodyData,
						["content"],
						resolveFileToken(
							argv["content"] as string | undefined,
							"content",
							"text"
						)
					);
				if (argv["publish"] !== undefined)
					setNestedValue(bodyData, ["publish"], argv["publish"]);
				if (argv["tlp"] !== undefined)
					setNestedValue(bodyData, ["tlp"], argv["tlp"]);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/cloudforce-one/v2/requests/${encodeURIComponent(String(argv["project-type"]))}/${encodeURIComponent(String(argv["request-id"]))}/messages/${encodeURIComponent(String(argv["message-id"]))}`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
