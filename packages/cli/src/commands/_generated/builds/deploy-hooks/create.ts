/**
 * create command
 * @generated from apis/overlays/builds.ts
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
	command: "create <worker>",
	describe: "Create a deploy hook",
	usage:
		"$0 builds deploy-hooks create <worker>\n\nCreate an HTTP hook that starts a build for a selected Worker branch.",
	flags: {
		branch: {
			kind: "parsed",
			brief: "Git branch name.",
			optional: true,
			parse: String,
		},
		"deploy-hook-name": {
			kind: "parsed",
			brief: "Deploy hook name (1-58 characters).",
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
			placeholder: "worker",
			brief: "Name or script tag of the Worker.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds deploy-hooks create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["branch"] === undefined) {
						argv["branch"] = await promptForRequiredField(
							"branch",
							"Git branch name."
						);
					}
					if (argv["deploy-hook-name"] === undefined) {
						argv["deploy-hook-name"] = await promptForRequiredField(
							"deploy-hook-name",
							"Deploy hook name (1-58 characters)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds deploy-hooks create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/deploy_hooks`,
						pathParams: { worker: String(argv["worker"] ?? "") },
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
										deploy_hook_name: resolveFileToken(
											argv["deploy-hook-name"] as string | undefined,
											"deploy-hook-name",
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
							`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/deploy_hooks`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["branch"] !== undefined)
					setNestedValue(
						bodyData,
						["branch"],
						resolveFileToken(
							argv["branch"] as string | undefined,
							"branch",
							"text"
						)
					);
				if (argv["deploy-hook-name"] !== undefined)
					setNestedValue(
						bodyData,
						["deploy_hook_name"],
						resolveFileToken(
							argv["deploy-hook-name"] as string | undefined,
							"deploy-hook-name",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/deploy_hooks`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
