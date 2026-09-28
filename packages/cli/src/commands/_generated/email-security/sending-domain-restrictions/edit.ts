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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security sending-domain-restrictions edit <sending-domain-restriction-id>\n\nUpdates an existing sending domain restriction. Only provided fields will be modified. Changes affect which domains require TLS and which subdomains are excluded."
		)
		.positional("sending-domain-restriction-id", {
			type: "string",
			description: "Sending domain restriction identifier.",
			demandOption: true,
		})
		.option("comments", { type: "string", description: "The comments field" })
		.option("domain", {
			type: "string",
			description: "Domain that requires TLS enforcement.",
		})
		.option("exclude", {
			type: "string",
			array: true,
			description: "Subdomains to exempt from TLS requirements.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Update a sending domain restriction.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_update_sending_domain_restriction">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <sending-domain-restriction-id>",
	describe: "Update a sending domain restriction",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security sending-domain-restrictions edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.emailSecurity.sendingDomainRestrictions.edit({
							...bodyData,
							account_id: accountId,
							sending_domain_restriction_id:
								argv["sending-domain-restriction-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.emailSecurity.sendingDomainRestrictions.edit({
						...bodyData,
						account_id: accountId,
						sending_domain_restriction_id:
							argv["sending-domain-restriction-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
