import operation from "../../../_operations/zero-trust/cws/tenant-structures/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
	command: "update <structure-id>",
	describe: "Update a tenant structure",
	usage:
		"$0 zero-trust cws tenant-structures update <structure-id>\n\nUpdates the tenant structure's name and import path; its application remains immutable.",
	flags: {
		application: {
			kind: "parsed",
			brief: "Platform this structure models. Must match the existing value.",
			optional: true,
			choices: ["aws", "cloudflare"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "application", "text"),
		},
		"import-path": {
			kind: "parsed",
			brief:
				"Optional unique Rego mount path in the form tenant.<application>.<name>; application must match. Omit to clear.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name; unique per account",
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
			placeholder: "structure-id",
			brief: "ID of the tenant structure to update",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws tenant-structures update",
				classification: {
					safeFlags: ["application", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["application"] === undefined) {
						argv["application"] = await promptForRequiredEnumField(
							"application",
							"Platform this structure models. Must match the existing value.",
							["aws", "cloudflare"] as const
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Human-readable name; unique per account"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws tenant-structures update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/tenant-structures/${argv["structure-id"] == null ? "<structure-id>" : encodeURIComponent(String(argv["structure-id"]))}`,
						pathParams: { "structure-id": String(argv["structure-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										application: argv["application"],
										import_path: resolveFileToken(
											argv["import-path"] as string | undefined,
											"import-path",
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
							structure_id: argv["structure-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					application: argv["application"],
					import_path: resolveFileToken(
						argv["import-path"] as string | undefined,
						"import-path",
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
						structure_id: argv["structure-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
