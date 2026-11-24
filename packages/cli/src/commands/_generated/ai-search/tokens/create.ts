import operation from "../../_operations/ai-search/tokens/create.js";
/**
 * create command
 * @generated from apis/overlays/ai-search.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <name>",
	describe: "Create a token",
	usage:
		"$0 ai-search tokens create <name>\n\nCreate a stored Cloudflare credential for an AI Search instance to access its data source.",
	flags: {
		"api-token-id": {
			kind: "parsed",
			brief: "Cloudflare API token ID.",
			optional: true,
			parse: String,
		},
		"api-token": {
			kind: "parsed",
			brief: "Cloudflare API token value.",
			optional: true,
			parse: String,
		},
		legacy: {
			kind: "boolean",
			brief: "Whether the credential uses the legacy API key format.",
			default: true,
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
			placeholder: "name",
			brief: "Human-readable name for the credential.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search tokens create",
				classification: {
					safeFlags: ["legacy", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["api-token-id"] === undefined) {
						argv["api-token-id"] = await promptForRequiredField(
							"api-token-id",
							"Cloudflare API token ID."
						);
					}
					if (argv["api-token"] === undefined) {
						argv["api-token"] = await promptForRequiredField(
							"api-token",
							"Cloudflare API token value.",
							{ kind: "secret" }
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/tokens`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? mergeBodyPositionals(parseBody(argv.body), [
										{ name: "name", field: "name", value: argv["name"] },
									])
								: compactBody({
										cf_api_id: resolveFileToken(
											argv["api-token-id"] as string | undefined,
											"api-token-id",
											"text"
										),
										cf_api_key: resolveFileToken(
											argv["api-token"] as string | undefined,
											"api-token",
											"text"
										),
										legacy: argv["legacy"],
										name: argv["name"],
									}),
						sensitiveBodyPaths: [["cf_api_key"]],
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? mergeBodyPositionals(parseBody(argv.body), [
								{ name: "name", field: "name", value: argv["name"] },
							])
						: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					cf_api_id: resolveFileToken(
						argv["api-token-id"] as string | undefined,
						"api-token-id",
						"text"
					),
					cf_api_key: resolveFileToken(
						argv["api-token"] as string | undefined,
						"api-token",
						"text"
					),
					legacy: argv["legacy"],
					name: argv["name"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
