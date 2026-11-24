import operation from "../_operations/agent-memory/summary.js";
/**
 * summary command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "summary <profile-name>",
	describe: "Get a profile summary",
	usage:
		"$0 agent-memory summary <profile-name>\n\nGenerates a paste-ready prompt block summarizing everything stored in a memory profile.",
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		"session-id": {
			kind: "parsed",
			brief: "Session identifier.",
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
		{ placeholder: "profile-name", brief: "Profile name.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory summary",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory summary",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/summary`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										sessionId: resolveFileToken(
											argv["session-id"] as string | undefined,
											"session-id",
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

				// Assemble request body from individual flags
				const bodyData = compactBody({
					sessionId: resolveFileToken(
						argv["session-id"] as string | undefined,
						"session-id",
						"text"
					),
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
