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
			"$0 email-security block-senders create\n\nCreates a new blocked sender pattern. Emails matching this pattern will be blocked from delivery. Patterns can be email addresses, domains, or IP addresses, and support regular expressions."
		)
		.option("comments", { type: "string", description: "The comments field" })
		.option("is-regex", {
			type: "boolean",
			description:
				"Whether `pattern` is a regular expression instead of a literal value.",
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
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create a blocked sender pattern.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_create_blocked_sender">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create blocked email sender",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security block-senders create",
				classification: {
					safeFlags: ["is-regex", "pattern-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security block-senders create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/block_senders`,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.emailSecurity.blockSenders.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comments: resolveFileToken(
						argv["comments"] as string | undefined,
						"comments",
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
				const result = await withProgress(`Creating`, async () =>
					client.emailSecurity.blockSenders.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
