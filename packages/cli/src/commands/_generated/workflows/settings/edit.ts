import operation from "../../_operations/workflows/settings/edit.js";
/**
 * edit command
 * @generated from apis/overlays/workflows.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseScalarValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Update account settings",
	usage:
		"$0 workflows settings edit\n\nUpdates only the account-level Workflows settings fields present in the request body.",
	flags: {
		"default-retention-error-retention": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"default-retention-success-retention": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
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
				command: "workflows settings edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows settings edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/settings`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default_retention: {
											error_retention: parseScalarValue(
												argv["default-retention-error-retention"],
												"default-retention-error-retention"
											),
											success_retention: parseScalarValue(
												argv["default-retention-success-retention"],
												"default-retention-success-retention"
											),
										},
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					default_retention: {
						error_retention: parseScalarValue(
							argv["default-retention-error-retention"],
							"default-retention-error-retention"
						),
						success_retention: parseScalarValue(
							argv["default-retention-success-retention"],
							"default-retention-success-retention"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
