import operation from "../../_operations/email-routing/addresses/edit.js";
/**
 * edit command
 * @generated from apis/overlays/email-routing.ts
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <destination-address-identifier>",
	describe: "Update destination address",
	usage:
		"$0 email-routing addresses edit <destination-address-identifier>\n\nUpdates the status of a specific destination address.",
	flags: {
		status: {
			kind: "parsed",
			brief:
				"Destination address status. Non-admin callers may only set verified addresses back to unverified; setting to verified requires admin privileges.",
			optional: true,
			choices: ["unverified", "verified"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
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
			placeholder: "destination-address-identifier",
			brief: "Destination address identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing addresses edit",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["status"] === undefined) {
						argv["status"] = await promptForRequiredEnumField(
							"status",
							"Destination address status. Non-admin callers may only set verified addresses back to unverified; setting to verified requires admin privileges.",
							["unverified", "verified"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-routing addresses edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/routing/addresses/${argv["destination-address-identifier"] == null ? "<destination-address-identifier>" : encodeURIComponent(String(argv["destination-address-identifier"]))}`,
						pathParams: {
							"destination-address-identifier": String(
								argv["destination-address-identifier"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										status: argv["status"],
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
							destination_address_identifier:
								argv["destination-address-identifier"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					status: argv["status"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						destination_address_identifier:
							argv["destination-address-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
