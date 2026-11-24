import operation from "../../../../_operations/cloudforce-one/threat-intel/events/queries/create.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "create",
	describe: "Create a saved event query",
	usage:
		"$0 cloudforce-one threat-intel events queries create\n\nSaves an event query under a unique `name`. `query_json` holds the query parameters as a JSON string.",
	flags: {
		"alert-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			default: false,
		},
		"alert-rollup-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			default: false,
		},
		name: {
			kind: "parsed",
			brief: "Unique name for the saved query",
			optional: true,
			parse: String,
		},
		"query-json": {
			kind: "parsed",
			brief: "JSON string containing the query parameters",
			optional: true,
			parse: String,
		},
		"rule-enabled": {
			kind: "boolean",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
			default: false,
		},
		"rule-scope": {
			kind: "parsed",
			brief:
				"Deprecated and ignored: saved-query alerting and rules were removed.",
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
				command: "cloudforce-one threat-intel events queries create",
				classification: {
					safeFlags: [
						"alert-enabled",
						"alert-rollup-enabled",
						"rule-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Unique name for the saved query"
						);
					}
					if (argv["query-json"] === undefined) {
						argv["query-json"] = await promptForRequiredField(
							"query-json",
							"JSON string containing the query parameters"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events queries create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/queries/create`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										alert_enabled: argv["alert-enabled"],
										alert_rollup_enabled: argv["alert-rollup-enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										query_json: resolveFileToken(
											argv["query-json"] as string | undefined,
											"query-json",
											"text"
										),
										rule_enabled: argv["rule-enabled"],
										rule_scope: resolveFileToken(
											argv["rule-scope"] as string | undefined,
											"rule-scope",
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
					alert_enabled: argv["alert-enabled"],
					alert_rollup_enabled: argv["alert-rollup-enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					query_json: resolveFileToken(
						argv["query-json"] as string | undefined,
						"query-json",
						"text"
					),
					rule_enabled: argv["rule-enabled"],
					rule_scope: resolveFileToken(
						argv["rule-scope"] as string | undefined,
						"rule-scope",
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
