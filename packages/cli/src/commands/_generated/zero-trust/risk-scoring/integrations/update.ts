import operation from "../../../_operations/zero-trust/risk-scoring/integrations/update.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <integration-id>",
	describe: "Update a risk score integration.",
	usage:
		"$0 zero-trust risk-scoring integrations update <integration-id>\n\nOverwrite the reference_id, tenant_url, and active values with the ones provided.",
	flags: {
		active: {
			kind: "boolean",
			brief:
				"Whether this integration is enabled. If disabled, no risk changes will be exported to the third-party.",
			optional: true,
		},
		"reference-id": {
			kind: "parsed",
			brief:
				"A reference id that can be supplied by the client. Currently this should be set to the Access-Okta IDP ID (a UUIDv4).\nhttps://developers.cloudflare.com/api/operations/access-identity-providers-get-an-access-identity-provider",
			optional: true,
			parse: String,
		},
		"tenant-url": {
			kind: "parsed",
			brief: 'The base url of the tenant, e.g. "https://tenant.okta.com".',
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
		{ placeholder: "integration-id", brief: "Integration ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust risk-scoring integrations update",
				classification: {
					safeFlags: ["active", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["active"] === undefined) {
						throw new Error(
							"--active is required (or pass --body with this field set)."
						);
					}
					if (argv["tenant-url"] === undefined) {
						argv["tenant-url"] = await promptForRequiredField(
							"tenant-url",
							'The base url of the tenant, e.g. "https://tenant.okta.com".'
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust risk-scoring integrations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zt_risk_scoring/integrations/${argv["integration-id"] == null ? "<integration-id>" : encodeURIComponent(String(argv["integration-id"]))}`,
						pathParams: {
							"integration-id": String(argv["integration-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										active: argv["active"],
										reference_id: resolveFileToken(
											argv["reference-id"] as string | undefined,
											"reference-id",
											"text"
										),
										tenant_url: resolveFileToken(
											argv["tenant-url"] as string | undefined,
											"tenant-url",
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
							integration_id: argv["integration-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					active: argv["active"],
					reference_id: resolveFileToken(
						argv["reference-id"] as string | undefined,
						"reference-id",
						"text"
					),
					tenant_url: resolveFileToken(
						argv["tenant-url"] as string | undefined,
						"tenant-url",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						integration_id: argv["integration-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
