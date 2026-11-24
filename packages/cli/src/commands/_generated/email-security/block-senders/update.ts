import operation from "../../_operations/email-security/block-senders/update.js";
/**
 * update command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <pattern-id>",
	describe: "Replace a blocked email sender",
	usage:
		"$0 email-security block-senders update <pattern-id>\n\nReplaces an existing blocked sender pattern in full. Unlike PATCH, every field is taken from the request body, so optional fields that are omitted are reset rather than left untouched. Use this when managing blocked senders declaratively.",
	flags: {
		comments: {
			kind: "parsed",
			brief: "The comments field",
			optional: true,
			parse: String,
		},
		"expires-at": {
			kind: "parsed",
			brief:
				"Timestamp at which the pattern expires. After this time, Email Security ignores the pattern. The value must lie in the future. Send `null` to clear the expiration.",
			optional: true,
			parse: String,
		},
		"is-regex": {
			kind: "boolean",
			brief:
				"Whether `pattern` is a regular expression instead of a literal value.",
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief:
				"The pattern value to match. The format depends on `pattern_type`: a valid email address for EMAIL (e.g. `user@example.com`), a valid domain name for DOMAIN (e.g. `example.com`), or a plain IPv4 or IPv6 address or CIDR block for IP (e.g. `1.2.3.4`, `1.2.3.0/24`, `2606:4700:4700::1111`, or `2606:4700:4700::/48`); the API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents.",
			optional: true,
			parse: String,
		},
		"pattern-type": {
			kind: "parsed",
			brief:
				"Type of pattern matching.\n- EMAIL: matches a full email address (e.g. `user@example.com`)\n- DOMAIN: matches a domain name (e.g. `example.com`)\n- IP: matches a plain IPv4 or IPv6 address (e.g. `1.2.3.4` or `2606:4700:4700::1111`) or CIDR block (e.g. `1.2.3.0/24` or `2606:4700:4700::/48`). The API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents.\n- UNKNOWN: deprecated; you cannot use this when creating or updating policies, but it may appear on existing entries.\n",
			optional: true,
			choices: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "pattern-type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Create a blocked sender pattern.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "pattern-id",
			brief: "Blocked sender pattern identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security block-senders update",
				classification: {
					safeFlags: ["is-regex", "pattern-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["is-regex"] === undefined) {
						throw new Error(
							"--is-regex is required (or pass --body with this field set)."
						);
					}
					if (argv["pattern"] === undefined) {
						argv["pattern"] = await promptForRequiredField(
							"pattern",
							"The pattern value to match. The format depends on \`pattern_type\`: a valid email address for EMAIL (e.g. \`user@example.com\`), a valid domain name for DOMAIN (e.g. \`example.com\`), or a plain IPv4 or IPv6 address or CIDR block for IP (e.g. \`1.2.3.4\`, \`1.2.3.0/24\`, \`2606:4700:4700::1111\`, or \`2606:4700:4700::/48\`); the API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents."
						);
					}
					if (argv["pattern-type"] === undefined) {
						argv["pattern-type"] = await promptForRequiredEnumField(
							"pattern-type",
							"Type of pattern matching. - EMAIL: matches a full email address (e.g. \`user@example.com\`) - DOMAIN: matches a domain name (e.g. \`example.com\`) - IP: matches a plain IPv4 or IPv6 address (e.g. \`1.2.3.4\` or \`2606:4700:4700::1111\`) or CIDR block (e.g. \`1.2.3.0/24\` or \`2606:4700:4700::/48\`). The API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents. - UNKNOWN: deprecated; you cannot use this when creating or updating policies, but it may appear on existing entries. ",
							["EMAIL", "DOMAIN", "IP", "UNKNOWN"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security block-senders update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/block_senders/${argv["pattern-id"] == null ? "<pattern-id>" : encodeURIComponent(String(argv["pattern-id"]))}`,
						pathParams: { "pattern-id": String(argv["pattern-id"] ?? "") },
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
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										is_regex: argv["is-regex"],
										pattern: resolveFileToken(
											argv["pattern"] as string | undefined,
											"pattern",
											"text"
										),
										pattern_type: argv["pattern-type"],
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
							pattern_id: argv["pattern-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					is_regex: argv["is-regex"],
					pattern: resolveFileToken(
						argv["pattern"] as string | undefined,
						"pattern",
						"text"
					),
					pattern_type: argv["pattern-type"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						pattern_id: argv["pattern-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
