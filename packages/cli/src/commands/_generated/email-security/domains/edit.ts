import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security domains edit <domain-id>\n\nUpdates configuration for a protected email domain. Only provided fields will be modified. Changes affect delivery mode, security settings, and regional processing."
		)
		.positional("domain-id", {
			type: "string",
			description: "Domain identifier.",
			demandOption: true,
		})
		.option("allowed-delivery-modes", {
			type: "string",
			array: true,
			description: "Delivery modes to onboard the domain through.",
		})
		.option("drop-dispositions", {
			type: "string",
			array: true,
			description:
				'Dispositions to drop instead of delivering, e.g. `["MALICIOUS", "SPAM"]`.',
		})
		.option("folder", {
			type: "string",
			description: "The mailbox folder to scan, for API-scanning domains.",
			choices: ["AllItems", "Inbox"],
		})
		.coerce("folder", (value) => resolveFileToken(value, "folder", "text"))
		.option("integration-id", {
			type: "string",
			description:
				"Identifier of the CASB integration that authorizes this domain. The integration also enables API scanning, post-delivery actions, and directory sync.",
		})
		.option("ip-restrictions", {
			type: "string",
			array: true,
			description:
				"Source IP ranges mail is accepted from. Any other source is rejected.",
		})
		.option("lookback-hops", {
			type: "number",
			description:
				"Number of hops to trace back through received headers when reconstructing the original message (1-20).",
		})
		.option("regions", {
			type: "string",
			array: true,
			description:
				'Regions that process messages for this domain, e.g. `["GLOBAL"]` or `["US"]`.',
		})
		.option("require-tls-inbound", {
			type: "boolean",
			description: "Require TLS on inbound connections.",
		})
		.option("require-tls-outbound", {
			type: "boolean",
			description: "Require TLS on outbound connections.",
		})
		.option("transport", {
			type: "string",
			description:
				"The mail transport hostname for MX/Inline delivery — the MX record Cloudflare delivers email to (e.g. `mx.example.com`).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email_security_update_domain">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <domain-id>",
	describe: "Update an email domain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security domains edit",
				classification: {
					safeFlags: [
						"folder",
						"require-tls-inbound",
						"require-tls-outbound",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security domains edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/domains/${argv["domain-id"] == null ? "<domain-id>" : encodeURIComponent(String(argv["domain-id"]))}`,
						pathParams: { "domain-id": String(argv["domain-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allowed_delivery_modes: argv["allowed-delivery-modes"],
										drop_dispositions: argv["drop-dispositions"],
										folder: argv["folder"],
										integration_id: resolveFileToken(
											argv["integration-id"] as string | undefined,
											"integration-id",
											"text"
										),
										ip_restrictions: argv["ip-restrictions"],
										lookback_hops: argv["lookback-hops"],
										regions: argv["regions"],
										require_tls_inbound: argv["require-tls-inbound"],
										require_tls_outbound: argv["require-tls-outbound"],
										transport: resolveFileToken(
											argv["transport"] as string | undefined,
											"transport",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.emailSecurity.domains.edit({
							body: bodyData,
							account_id: accountId,
							domain_id: argv["domain-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allowed_delivery_modes: argv["allowed-delivery-modes"],
					drop_dispositions: argv["drop-dispositions"],
					folder: argv["folder"],
					integration_id: resolveFileToken(
						argv["integration-id"] as string | undefined,
						"integration-id",
						"text"
					),
					ip_restrictions: argv["ip-restrictions"],
					lookback_hops: argv["lookback-hops"],
					regions: argv["regions"],
					require_tls_inbound: argv["require-tls-inbound"],
					require_tls_outbound: argv["require-tls-outbound"],
					transport: resolveFileToken(
						argv["transport"] as string | undefined,
						"transport",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailSecurity.domains.edit({
						body: bodyData,
						account_id: accountId,
						domain_id: argv["domain-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
