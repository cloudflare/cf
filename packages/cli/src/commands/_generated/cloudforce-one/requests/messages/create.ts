import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one requests messages create <request-id>\n\nCreates a customer dashboard message on an RFI request. Messages are always published on send. Workflow-enabled projects require Idempotency-Key and atomically record message activity and any policy transition. For token-billed project types, substantive follow-on messages consume message tokens and are subject to quarterly quota enforcement."
		)
		.positional("request-id", {
			type: "string",
			description: "Request ID",
			demandOption: true,
		})
		.option("project-type", {
			type: "string",
			description: "Project type",
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
		.option("author-id", { type: "string", description: "The author_id field" })
		.option("author-name", {
			type: "string",
			description: "The author_name field",
		})
		.option("content", { type: "string", description: "The content field" })
		.option("publish", {
			type: "boolean",
			description: "The publish field",
			default: false,
		})
		.option("tlp", {
			type: "string",
			description: "The tlp field",
			choices: ["clear", "green", "amber", "amber-strict", "red", "white"],
			default: "red",
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
	command: "create <request-id>",
	describe: "Create a customer follow-on message on an RFI request",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests messages create",
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
						command: "cf cloudforce-one requests messages create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/messages/new`,
						pathParams: {
							"project-type": String(argv["project-type"] ?? ""),
							"request-id": String(argv["request-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										attachment_asset_ids: argv["attachment-asset-ids"],
										author_id: resolveFileToken(
											argv["author-id"] as string | undefined,
											"author-id",
											"text"
										),
										author_name: resolveFileToken(
											argv["author-name"] as string | undefined,
											"author-name",
											"text"
										),
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
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/cloudforce-one/v2/requests/${encodeURIComponent(String(argv["project-type"]))}/${encodeURIComponent(String(argv["request-id"]))}/messages/new`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["content"] === undefined) {
					argv["content"] = await promptForRequiredField(
						"content",
						"The content field"
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
				if (argv["author-id"] !== undefined)
					setNestedValue(
						bodyData,
						["author_id"],
						resolveFileToken(
							argv["author-id"] as string | undefined,
							"author-id",
							"text"
						)
					);
				if (argv["author-name"] !== undefined)
					setNestedValue(
						bodyData,
						["author_name"],
						resolveFileToken(
							argv["author-name"] as string | undefined,
							"author-name",
							"text"
						)
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
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/cloudforce-one/v2/requests/${encodeURIComponent(String(argv["project-type"]))}/${encodeURIComponent(String(argv["request-id"]))}/messages/new`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
