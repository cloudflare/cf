/**
 * create command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <instance-id>",
	describe: "Create new job",
	usage:
		"$0 ai-search jobs create <instance-id>\n\nCreates a new indexing job for an AI Search instance.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional description for the indexing job.",
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
				command: "ai-search jobs create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/jobs`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
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
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/jobs`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["description"] !== undefined)
					setNestedValue(
						bodyData,
						["description"],
						resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/jobs`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
