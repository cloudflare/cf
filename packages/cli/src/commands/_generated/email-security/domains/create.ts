import operation from "../../_operations/email-security/domains/create.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Add a new email domain",
	usage:
		"$0 email-security domains create\n\nProtects a new email domain by adding it to Email Security. Accepts a flat configuration object covering all delivery modes. Returns the newly created domain configuration.",
	flags: {
		"allowed-delivery-modes": {
			kind: "parsed",
			brief: "Delivery modes to onboard the domain through.",
			variadic: true,
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "The email domain to protect.",
			optional: true,
			parse: String,
		},
		"drop-dispositions": {
			kind: "parsed",
			brief:
				'Dispositions to drop instead of delivering, e.g. `["MALICIOUS", "SPAM"]`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		folder: {
			kind: "parsed",
			brief: "The mailbox folder to scan, for API-scanning domains.",
			optional: true,
			choices: ["AllItems", "Inbox"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "folder", "text"),
		},
		"integration-id": {
			kind: "parsed",
			brief:
				"Identifier of the CASB integration that authorizes this domain. The integration also enables API scanning, post-delivery actions, and directory sync.",
			optional: true,
			parse: String,
		},
		"ip-restrictions": {
			kind: "parsed",
			brief:
				"Source IP ranges mail is accepted from. Any other source is rejected.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"lookback-hops": {
			kind: "parsed",
			brief:
				"Number of hops to trace back through received headers when reconstructing the original message (1-20).",
			optional: true,
			parse: Number,
		},
		regions: {
			kind: "parsed",
			brief:
				'Regions that process messages for this domain, e.g. `["GLOBAL"]` or `["US"]`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"require-tls-inbound": {
			kind: "boolean",
			brief: "Require TLS on inbound connections.",
			optional: true,
		},
		"require-tls-outbound": {
			kind: "boolean",
			brief: "Require TLS on outbound connections.",
			optional: true,
		},
		transport: {
			kind: "parsed",
			brief:
				"The mail transport hostname for MX/Inline delivery — the MX record Cloudflare delivers email to (e.g. `mx.example.com`).",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security domains create",
				classification: {
					safeFlags: [
						"folder",
						"require-tls-inbound",
						"require-tls-outbound",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["allowed-delivery-modes"] === undefined) {
						throw new Error(
							"--allowed-delivery-modes is required (or pass --body with this field set)."
						);
					}
					if (argv["domain"] === undefined) {
						argv["domain"] = await promptForRequiredField(
							"domain",
							"The email domain to protect."
						);
					}
					if (argv["drop-dispositions"] === undefined) {
						throw new Error(
							"--drop-dispositions is required (or pass --body with this field set)."
						);
					}
					if (argv["ip-restrictions"] === undefined) {
						throw new Error(
							"--ip-restrictions is required (or pass --body with this field set)."
						);
					}
					if (argv["regions"] === undefined) {
						throw new Error(
							"--regions is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security domains create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/domains`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allowed_delivery_modes: argv["allowed-delivery-modes"],
										domain: resolveFileToken(
											argv["domain"] as string | undefined,
											"domain",
											"text"
										),
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					allowed_delivery_modes: argv["allowed-delivery-modes"],
					domain: resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					),
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
