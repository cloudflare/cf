import operation from "../../../_operations/artifacts/namespaces/tokens/create.js";
/**
 * create command
 * @generated from apis/overlays/artifacts.ts
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
	command: "create <namespace>",
	describe: "Create a repository token",
	usage:
		"$0 artifacts namespaces tokens create <namespace>\n\nCreates a scoped Git token for a repository.",
	flags: {
		repo: {
			kind: "parsed",
			brief: "The repo field",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief: "The scope field",
			optional: true,
			choices: ["read", "write"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
		},
		ttl: {
			kind: "parsed",
			brief: "The ttl field",
			optional: true,
			parse: Number,
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
			placeholder: "namespace",
			brief: "Artifacts namespace name.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces tokens create",
				classification: {
					safeFlags: ["scope", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["repo"] === undefined) {
						argv["repo"] = await promptForRequiredField(
							"repo",
							"The repo field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tokens`,
						pathParams: { namespace: String(argv["namespace"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										repo: resolveFileToken(
											argv["repo"] as string | undefined,
											"repo",
											"text"
										),
										scope: argv["scope"],
										ttl: argv["ttl"],
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
							namespace: argv["namespace"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					repo: resolveFileToken(
						argv["repo"] as string | undefined,
						"repo",
						"text"
					),
					scope: argv["scope"],
					ttl: argv["ttl"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
