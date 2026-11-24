import operation from "../_operations/ai/websearch.js";
/**
 * websearch command
 * @generated from apis/overlays/ai.ts
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
	command: "websearch",
	describe: "Search the web through AI Gateway",
	usage: "$0 ai websearch\n\nRun a web search through a configured AI Gateway.",
	flags: {
		"byok-alias": {
			kind: "parsed",
			brief: "The byokAlias field",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "The limit field",
			optional: true,
			parse: Number,
		},
		"options-gateway-id": {
			kind: "parsed",
			brief: "The options.gateway.id field",
			optional: true,
			parse: String,
		},
		provider: {
			kind: "parsed",
			brief: "The provider field",
			optional: true,
			parse: String,
		},
		query: {
			kind: "parsed",
			brief: "The query field",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai websearch",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["options-gateway-id"] === undefined) {
						argv["options-gateway-id"] = await promptForRequiredField(
							"options-gateway-id",
							"The options.gateway.id field"
						);
					}
					if (argv["query"] === undefined) {
						argv["query"] = await promptForRequiredField(
							"query",
							"The query field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai websearch",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/websearch`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										byokAlias: resolveFileToken(
											argv["byok-alias"] as string | undefined,
											"byok-alias",
											"text"
										),
										limit: argv["limit"],
										options: {
											gateway: {
												id: resolveFileToken(
													argv["options-gateway-id"] as string | undefined,
													"options-gateway-id",
													"text"
												),
											},
										},
										provider: resolveFileToken(
											argv["provider"] as string | undefined,
											"provider",
											"text"
										),
										query: resolveFileToken(
											argv["query"] as string | undefined,
											"query",
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					byokAlias: resolveFileToken(
						argv["byok-alias"] as string | undefined,
						"byok-alias",
						"text"
					),
					limit: argv["limit"],
					options: {
						gateway: {
							id: resolveFileToken(
								argv["options-gateway-id"] as string | undefined,
								"options-gateway-id",
								"text"
							),
						},
					},
					provider: resolveFileToken(
						argv["provider"] as string | undefined,
						"provider",
						"text"
					),
					query: resolveFileToken(
						argv["query"] as string | undefined,
						"query",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
