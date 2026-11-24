import operation from "../_operations/agent-memory/recall.js";
/**
 * recall command
 * @generated from apis/overlays/agent-memory.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "recall <profile-name>",
	describe: "Recall memories",
	usage:
		"$0 agent-memory recall <profile-name>\n\nRetrieves memories relevant to the query and returns a synthesized answer.",
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		query: {
			kind: "parsed",
			brief: "Natural-language query to match against stored memories.",
			optional: true,
			parse: String,
		},
		"reference-date": {
			kind: "parsed",
			brief: "Temporal anchor for relative date references in the query.",
			optional: true,
			parse: String,
		},
		"response-length": {
			kind: "parsed",
			brief: "Verbosity of the synthesized answer. Defaults to 'medium'.",
			optional: true,
			choices: ["short", "medium", "long"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "response-length", "text"),
		},
		"thinking-level": {
			kind: "parsed",
			brief: "Recall intensity / search depth. Defaults to 'low'.",
			optional: true,
			choices: ["low", "medium", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "thinking-level", "text"),
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
		{ placeholder: "profile-name", brief: "Profile name.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory recall",
				classification: {
					safeFlags: ["response-length", "thinking-level", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["query"] === undefined) {
						argv["query"] = await promptForRequiredField(
							"query",
							"Natural-language query to match against stored memories."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory recall",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/recall`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										query: resolveFileToken(
											argv["query"] as string | undefined,
											"query",
											"text"
										),
										referenceDate: resolveFileToken(
											argv["reference-date"] as string | undefined,
											"reference-date",
											"text"
										),
										responseLength: argv["response-length"],
										thinkingLevel: argv["thinking-level"],
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							namespace_name: argv["namespace-name"],
							profile_name: argv["profile-name"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					query: resolveFileToken(
						argv["query"] as string | undefined,
						"query",
						"text"
					),
					referenceDate: resolveFileToken(
						argv["reference-date"] as string | undefined,
						"reference-date",
						"text"
					),
					responseLength: argv["response-length"],
					thinkingLevel: argv["thinking-level"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						namespace_name: argv["namespace-name"],
						profile_name: argv["profile-name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
