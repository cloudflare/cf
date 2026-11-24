import operation from "../../../_operations/o11y/issues/automations/create.js";
/**
 * create command
 * @generated from apis/overlays/o11y.ts
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
	describe: "Create an issue automation",
	usage:
		"$0 o11y issues automations create\n\nCreate an account or service issue automation.",
	flags: {
		"after-inactivity-seconds": {
			kind: "parsed",
			brief: "The afterInactivitySeconds field",
			optional: true,
			parse: Number,
		},
		"after-occurrences": {
			kind: "parsed",
			brief: "The afterOccurrences field",
			optional: true,
			parse: Number,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"policy-id": {
			kind: "parsed",
			brief: "The policyId field",
			optional: true,
			parse: String,
		},
		service: {
			kind: "parsed",
			brief: "The service field",
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
				command: "o11y issues automations create",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["policy-id"] === undefined) {
						argv["policy-id"] = await promptForRequiredField(
							"policy-id",
							"The policyId field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf o11y issues automations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/issues/automations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										afterInactivitySeconds: argv["after-inactivity-seconds"],
										afterOccurrences: argv["after-occurrences"],
										enabled: argv["enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										policyId: resolveFileToken(
											argv["policy-id"] as string | undefined,
											"policy-id",
											"text"
										),
										service: resolveFileToken(
											argv["service"] as string | undefined,
											"service",
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
					afterInactivitySeconds: argv["after-inactivity-seconds"],
					afterOccurrences: argv["after-occurrences"],
					enabled: argv["enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					policyId: resolveFileToken(
						argv["policy-id"] as string | undefined,
						"policy-id",
						"text"
					),
					service: resolveFileToken(
						argv["service"] as string | undefined,
						"service",
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
