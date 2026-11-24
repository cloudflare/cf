import operation from "../../_operations/accounts/profile/update.js";
/**
 * update command
 * @generated from apis/overlays/accounts.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update account profile",
	usage:
		"$0 accounts profile update\n\nPartially updates the business profile (name, email, phone, address, and external metadata) associated with this account's parent organization customer record, creating the profile if it does not exist. Changes apply to every account and organization sharing that profile. Omitted, empty, or null fields are left unchanged. Each profile field is limited to 1,000 UTF-8 bytes. Only available to members of an organization that contains the account.",
	flags: {
		"business-address": {
			kind: "parsed",
			brief: "The business_address field",
			optional: true,
			parse: String,
		},
		"business-email": {
			kind: "parsed",
			brief: "The business_email field",
			optional: true,
			parse: String,
		},
		"business-name": {
			kind: "parsed",
			brief: "The business_name field",
			optional: true,
			parse: String,
		},
		"business-phone": {
			kind: "parsed",
			brief: "The business_phone field",
			optional: true,
			parse: String,
		},
		"external-metadata": {
			kind: "parsed",
			brief: "The external_metadata field",
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
			brief:
				"Partial business profile update. Omitted, empty, or null fields remain unchanged. At least one of business name, address, phone, or email must be non-empty.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts profile update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts profile update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/profile`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										business_address: resolveFileToken(
											argv["business-address"] as string | undefined,
											"business-address",
											"text"
										),
										business_email: resolveFileToken(
											argv["business-email"] as string | undefined,
											"business-email",
											"text"
										),
										business_name: resolveFileToken(
											argv["business-name"] as string | undefined,
											"business-name",
											"text"
										),
										business_phone: resolveFileToken(
											argv["business-phone"] as string | undefined,
											"business-phone",
											"text"
										),
										external_metadata: resolveFileToken(
											argv["external-metadata"] as string | undefined,
											"external-metadata",
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					business_address: resolveFileToken(
						argv["business-address"] as string | undefined,
						"business-address",
						"text"
					),
					business_email: resolveFileToken(
						argv["business-email"] as string | undefined,
						"business-email",
						"text"
					),
					business_name: resolveFileToken(
						argv["business-name"] as string | undefined,
						"business-name",
						"text"
					),
					business_phone: resolveFileToken(
						argv["business-phone"] as string | undefined,
						"business-phone",
						"text"
					),
					external_metadata: resolveFileToken(
						argv["external-metadata"] as string | undefined,
						"external-metadata",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
