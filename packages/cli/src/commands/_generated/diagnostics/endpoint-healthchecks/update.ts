import operation from "../../_operations/diagnostics/endpoint-healthchecks/update.js";
/**
 * update command
 * @generated from apis/overlays/diagnostics.ts
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <id>",
	describe: "Update Endpoint Health Check",
	usage:
		"$0 diagnostics endpoint-healthchecks update <id>\n\nUpdate an Endpoint Health Check.",
	flags: {
		"check-type": {
			kind: "parsed",
			brief: "type of check to perform",
			optional: true,
			choices: ["icmp"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "check-type", "text"),
		},
		endpoint: {
			kind: "parsed",
			brief: "the IP address of the host to perform checks against",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Optional name associated with this check",
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
	operands: [{ placeholder: "id", brief: "UUID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "diagnostics endpoint-healthchecks update",
				classification: {
					safeFlags: ["check-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["check-type"] === undefined) {
						argv["check-type"] = await promptForRequiredEnumField(
							"check-type",
							"type of check to perform",
							["icmp"] as const
						);
					}
					if (argv["endpoint"] === undefined) {
						argv["endpoint"] = await promptForRequiredField(
							"endpoint",
							"the IP address of the host to perform checks against"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf diagnostics endpoint-healthchecks update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/diagnostics/endpoint-healthchecks/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										check_type: argv["check-type"],
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							id: argv["id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					check_type: argv["check-type"],
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
