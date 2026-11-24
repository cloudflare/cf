import operation from "../../../_operations/artifacts/namespaces/repos/import.js";
/**
 * import command
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
	command: "import <name>",
	describe: "Import a repository",
	usage:
		"$0 artifacts namespaces repos import <name>\n\nImports an HTTPS Git repository into an Artifacts repository.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		branch: {
			kind: "parsed",
			brief:
				"Git branch name. Must match /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/, must not contain '..', and must not end with '/' or '.'.",
			optional: true,
			parse: String,
		},
		depth: {
			kind: "parsed",
			brief: "The depth field",
			optional: true,
			parse: Number,
		},
		"read-only": {
			kind: "boolean",
			brief: "The read_only field",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief: "The url field",
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
	operands: [{ placeholder: "name", brief: "Repository name.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces repos import",
				classification: {
					safeFlags: ["read-only", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["url"] === undefined) {
						argv["url"] = await promptForRequiredField("url", "The url field");
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces repos import",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/repos/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/import`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										branch: resolveFileToken(
											argv["branch"] as string | undefined,
											"branch",
											"text"
										),
										depth: argv["depth"],
										read_only: argv["read-only"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
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
							namespace: argv["namespace"],
							name: argv["name"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					branch: resolveFileToken(
						argv["branch"] as string | undefined,
						"branch",
						"text"
					),
					depth: argv["depth"],
					read_only: argv["read-only"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
						name: argv["name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
