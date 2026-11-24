/**
 * move command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "move <instance-id>",
	describe: "Move an instance to a different namespace.",
	usage:
		"$0 ai-search move <instance-id>\n\nMoves an instance from its current namespace to the specified target namespace. Use 'default' with --destination-namespace to move the instance back to the default namespace. Fails with 400 if the target namespace already has an instance with the same id (ids must be unique within a namespace — the same id can exist in different namespaces).",
	flags: {
		"source-namespace": {
			kind: "parsed",
			brief: "Namespace currently containing the instance.",
			default: "default",
			parse: String,
		},
		"destination-namespace": {
			kind: "parsed",
			brief: "Namespace to move the instance into.",
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
		{
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search move",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["destination-namespace"] === undefined) {
						argv["destination-namespace"] = await promptForRequiredField(
							"destination-namespace",
							"Namespace to move the instance into."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search move",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["source-namespace"] == null ? "<source-namespace>" : encodeURIComponent(String(argv["source-namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}`,
						pathParams: {
							"source-namespace": String(argv["source-namespace"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										new_namespace: resolveFileToken(
											argv["destination-namespace"] as string | undefined,
											"destination-namespace",
											"text"
										),
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
							"PATCH",
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["source-namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["destination-namespace"] !== undefined)
					setNestedValue(
						bodyData,
						["new_namespace"],
						resolveFileToken(
							argv["destination-namespace"] as string | undefined,
							"destination-namespace",
							"text"
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["source-namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
