/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "update <message-id>",
	describe: "Update/publish a message for an RFI request",
	usage:
		"$0 cloudforce-one requests messages update <message-id>\n\nUpdates an existing message, typically to publish a draft by setting publish=true. Workflow-enabled publication requires Idempotency-Key and atomically records message activity and any policy transition.",
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
		"request-id": { kind: "parsed", brief: "Request ID", parse: String },
		"idempotency-key": {
			kind: "parsed",
			brief:
				"Client command key. Required when publishing a message for a workflow-enabled project; trimmed and limited to 255 characters.",
			optional: true,
			parse: String,
		},
		"attachment-asset-ids": {
			kind: "parsed",
			brief: "The attachment_asset_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		publish: { kind: "boolean", brief: "The publish field", optional: true },
		tlp: {
			kind: "parsed",
			brief: "The tlp field",
			optional: true,
			choices: ["clear", "green", "amber", "amber-strict", "red", "white"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "tlp", "text"),
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
	operands: [{ placeholder: "message-id", brief: "Message ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests messages update",
				classification: {
					safeFlags: ["publish", "tlp", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["idempotency-key"] !== undefined)
					headers["Idempotency-Key"] = String(argv["idempotency-key"]);
				const resolveRequiredFields = async (): Promise<void> => {
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
							[
								"clear",
								"green",
								"amber",
								"amber-strict",
								"red",
								"white",
							] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
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
				await resolveRequiredFields();

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
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
