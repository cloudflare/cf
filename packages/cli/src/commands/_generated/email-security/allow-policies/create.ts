import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security allow-policies create\n\nCreates a new allow policy that exempts matching emails from security detections. Use with caution as this bypasses email security scanning. Policies can match on sender patterns and apply to specific detections or all detections."
		)
		.option("comments", { type: "string", description: "The comments field" })
		.option("is-acceptable-sender", {
			type: "boolean",
			description:
				"Exempts messages from this sender from Spam, Spoof and Bulk dispositions only; Malicious and Suspicious dispositions still apply.",
		})
		.option("is-exempt-recipient", {
			type: "boolean",
			description: "Bypasses all detections for messages to this recipient.",
		})
		.option("is-recipient", {
			type: "boolean",
			description:
				"Deprecated as of July 1, 2025. Use `is_exempt_recipient` instead. End of life: July 1, 2026.",
		})
		.option("is-regex", { type: "boolean", description: "The is_regex field" })
		.option("is-sender", {
			type: "boolean",
			description:
				"Deprecated as of July 1, 2025. Use `is_trusted_sender` instead. End of life: July 1, 2026.",
		})
		.option("is-spoof", {
			type: "boolean",
			description:
				"Deprecated as of July 1, 2025. Use `is_acceptable_sender` instead. End of life: July 1, 2026.",
		})
		.option("is-trusted-sender", {
			type: "boolean",
			description:
				"Bypasses all detections and link following for messages from this sender.",
		})
		.option("pattern", {
			type: "string",
			description:
				"The pattern value to match. The format depends on `pattern_type`: a valid email address for EMAIL (e.g. `user@example.com`), a valid domain name for DOMAIN (e.g. `example.com`), or a plain IPv4 or IPv6 address or CIDR block for IP (e.g. `1.2.3.4`, `1.2.3.0/24`, `2606:4700:4700::1111`, or `2606:4700:4700::/48`); the API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents.",
		})
		.option("pattern-type", {
			type: "string",
			description:
				"Type of pattern matching.\n- EMAIL: matches a full email address (e.g. `user@example.com`)\n- DOMAIN: matches a domain name (e.g. `example.com`)\n- IP: matches a plain IPv4 or IPv6 address (e.g. `1.2.3.4` or `2606:4700:4700::1111`) or CIDR block (e.g. `1.2.3.0/24` or `2606:4700:4700::/48`). The API rejects private or unique-local, loopback, link-local, unspecified, and IPv4 broadcast addresses, including their IPv4-mapped IPv6 equivalents.\n- UNKNOWN: deprecated; you cannot use this when creating or updating policies, but it may appear on existing entries.\n",
			choices: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
		})
		.coerce("pattern-type", (value) =>
			resolveFileToken(value, "pattern-type", "text")
		)
		.option("verify-sender", {
			type: "boolean",
			description:
				"Enforce DMARC, SPF or DKIM authentication. When on, Email Security only honors policies that pass authentication.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create an allow policy.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_create_allow_policy">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create email allow policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security allow-policies create",
				classification: {
					safeFlags: [
						"is-acceptable-sender",
						"is-exempt-recipient",
						"is-recipient",
						"is-regex",
						"is-sender",
						"is-spoof",
						"is-trusted-sender",
						"pattern-type",
						"verify-sender",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security allow-policies create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/allow_policies`,
						pathParams: {},
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
										is_acceptable_sender: argv["is-acceptable-sender"],
										is_exempt_recipient: argv["is-exempt-recipient"],
										is_recipient: argv["is-recipient"],
										is_regex: argv["is-regex"],
										is_sender: argv["is-sender"],
										is_spoof: argv["is-spoof"],
										is_trusted_sender: argv["is-trusted-sender"],
										pattern: resolveFileToken(
											argv["pattern"] as string | undefined,
											"pattern",
											"text"
										),
										pattern_type: argv["pattern-type"],
										verify_sender: argv["verify-sender"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.emailSecurity.allowPolicies.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["is-acceptable-sender"] === undefined) {
					throw new Error(
						"--is-acceptable-sender is required (or pass --body with this field set)."
					);
				}
				if (argv["is-exempt-recipient"] === undefined) {
					throw new Error(
						"--is-exempt-recipient is required (or pass --body with this field set)."
					);
				}
				if (argv["is-regex"] === undefined) {
					throw new Error(
						"--is-regex is required (or pass --body with this field set)."
					);
				}
				if (argv["is-trusted-sender"] === undefined) {
					throw new Error(
						"--is-trusted-sender is required (or pass --body with this field set)."
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
				if (argv["verify-sender"] === undefined) {
					throw new Error(
						"--verify-sender is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
						"text"
					),
					is_acceptable_sender: argv["is-acceptable-sender"],
					is_exempt_recipient: argv["is-exempt-recipient"],
					is_recipient: argv["is-recipient"],
					is_regex: argv["is-regex"],
					is_sender: argv["is-sender"],
					is_spoof: argv["is-spoof"],
					is_trusted_sender: argv["is-trusted-sender"],
					pattern: resolveFileToken(
						argv["pattern"] as string | undefined,
						"pattern",
						"text"
					),
					pattern_type: argv["pattern-type"],
					verify_sender: argv["verify-sender"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.emailSecurity.allowPolicies.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
