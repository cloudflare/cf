import operation from "../../_operations/email-security/sending-domain-restrictions/edit.js";
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
	command: "edit <sending-domain-restriction-id>",
	describe: "Update a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions edit <sending-domain-restriction-id>\n\nUpdates an existing sending domain restriction. Only provided fields will be modified. Changes affect which domains require TLS and which subdomains are excluded.",
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "Domain that requires TLS enforcement.",
			optional: true,
			parse: String,
		},
		exclude: {
			kind: "parsed",
			brief: "Subdomains to exempt from TLS requirements.",
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
			brief: "Update a sending domain restriction.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "sending-domain-restriction-id",
			brief: "Sending domain restriction identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security sending-domain-restrictions edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security sending-domain-restrictions edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/sending_domain_restrictions/${argv["sending-domain-restriction-id"] == null ? "<sending-domain-restriction-id>" : encodeURIComponent(String(argv["sending-domain-restriction-id"]))}`,
						pathParams: {
							"sending-domain-restriction-id": String(
								argv["sending-domain-restriction-id"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comments: resolveFileToken(
											argv["comments"] as string | undefined,
											"comments",
											"text"
										),
										domain: resolveFileToken(
											argv["domain"] as string | undefined,
											"domain",
											"text"
										),
										exclude: argv["exclude"],
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
							sending_domain_restriction_id:
								argv["sending-domain-restriction-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					domain: resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					),
					exclude: argv["exclude"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						sending_domain_restriction_id:
							argv["sending-domain-restriction-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
