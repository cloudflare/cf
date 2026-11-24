import operation from "../../_operations/email-security/content-policies/edit.js";
/**
 * edit command
 * @generated from apis/overlays/email-security.ts
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
	command: "edit <policy-id>",
	describe: "Update a content policy",
	usage:
		"$0 email-security content-policies edit <policy-id>\n\nUpdates an existing content policy. Only provided fields will be modified.",
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Whether the policy is active.",
			optional: true,
		},
		"expires-at": {
			kind: "parsed",
			brief:
				"Timestamp at which the policy expires. After this time, Email Security ignores the policy. The value must lie in the future. Send `null` to clear the expiration.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name of the policy.",
			optional: true,
			parse: String,
		},
		notes: {
			kind: "parsed",
			brief: "Optional note describing the purpose of the policy.",
			optional: true,
			parse: String,
		},
		pattern: {
			kind: "parsed",
			brief: "Regular expression the policy matches against.",
			optional: true,
			parse: String,
		},
		targets: {
			kind: "parsed",
			brief: "Parts of the email the pattern is matched against.",
			variadic: true,
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
			brief: "Update a content policy.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "Content policy identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security content-policies edit",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security content-policies edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/content_policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										notes: resolveFileToken(
											argv["notes"] as string | undefined,
											"notes",
											"text"
										),
										pattern: resolveFileToken(
											argv["pattern"] as string | undefined,
											"pattern",
											"text"
										),
										targets: argv["targets"],
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
							policy_id: argv["policy-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					enabled: argv["enabled"],
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					notes: resolveFileToken(
						argv["notes"] as string | undefined,
						"notes",
						"text"
					),
					pattern: resolveFileToken(
						argv["pattern"] as string | undefined,
						"pattern",
						"text"
					),
					targets: argv["targets"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
