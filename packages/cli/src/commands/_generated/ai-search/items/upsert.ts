/**
 * upsert command
 * @generated from apis/overlays/ai-search.ts
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
	command: "upsert <instance-id>",
	describe: "Create or Update Item.",
	usage:
		"$0 ai-search items upsert <instance-id>\n\nCreates or updates an indexed item in an AI Search instance.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		key: {
			kind: "parsed",
			brief: "Item key / filename. Must not exceed 128 characters.",
			optional: true,
			parse: String,
		},
		"next-action": {
			kind: "parsed",
			brief: "The next_action field",
			optional: true,
			choices: ["INDEX"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "next-action", "text"),
		},
		"wait-for-completion": {
			kind: "boolean",
			brief:
				"Wait for indexing before responding. After processing, vector-indexed instances use any time remaining in a 25s wait budget to confirm Vectorize ingestion. Processing itself continues uninterrupted and can exceed that budget. If confirmation times out, the response returns the current item state and background indexing continues. Defaults to false.",
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
	operands: [
		{
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search items upsert",
				classification: {
					safeFlags: ["next-action", "wait-for-completion", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["key"] === undefined) {
						argv["key"] = await promptForRequiredField(
							"key",
							"Item key / filename. Must not exceed 128 characters."
						);
					}
					if (argv["next-action"] === undefined) {
						argv["next-action"] = await promptForRequiredEnumField(
							"next-action",
							"The next_action field",
							["INDEX"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search items upsert",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/items`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										key: resolveFileToken(
											argv["key"] as string | undefined,
											"key",
											"text"
										),
										next_action: argv["next-action"],
										wait_for_completion: argv["wait-for-completion"],
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
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["key"] !== undefined)
					setNestedValue(
						bodyData,
						["key"],
						resolveFileToken(argv["key"] as string | undefined, "key", "text")
					);
				if (argv["next-action"] !== undefined)
					setNestedValue(bodyData, ["next_action"], argv["next-action"]);
				if (argv["wait-for-completion"] !== undefined)
					setNestedValue(
						bodyData,
						["wait_for_completion"],
						argv["wait-for-completion"]
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
