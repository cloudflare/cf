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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security domains create\n\nProtects a new email domain by adding it to Email Security. Accepts a flat configuration object covering all delivery modes. Returns the newly created domain configuration."
		)
		.option("allowed-delivery-modes", {
			type: "string",
			array: true,
			description: "The allowed_delivery_modes field",
		})
		.option("domain", { type: "string", description: "The domain field" })
		.option("drop-dispositions", {
			type: "string",
			array: true,
			description: "The drop_dispositions field",
		})
		.option("integration-id", {
			type: "string",
			description: "The integration_id field",
		})
		.option("ip-restrictions", {
			type: "string",
			array: true,
			description: "The ip_restrictions field",
		})
		.option("lookback-hops", {
			type: "number",
			description: "The lookback_hops field",
		})
		.option("regions", {
			type: "string",
			array: true,
			description: "The regions field",
		})
		.option("require-tls-inbound", {
			type: "boolean",
			description: "The require_tls_inbound field",
		})
		.option("require-tls-outbound", {
			type: "boolean",
			description: "The require_tls_outbound field",
		})
		.option("transport", { type: "string", description: "The transport field" })
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

type Request = SdkRequest<"email_security_create_domains">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Add a new email domain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security domains create",
				classification: {
					safeFlags: ["require-tls-inbound", "require-tls-outbound", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
					const result = await withProgress(`Creating`, async () =>
						client.emailSecurity.domains.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["allowed-delivery-modes"] === undefined) {
					throw new Error(
						"--allowed-delivery-modes is required (or pass --body with this field set)."
					);
				}
				if (argv["domain"] === undefined) {
					argv["domain"] = await promptForRequiredField(
						"domain",
						"The domain field"
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allowed_delivery_modes: argv["allowed-delivery-modes"],
					domain: resolveFileToken(
						argv["domain"] as string | undefined,
						"domain",
						"text"
					),
					drop_dispositions: argv["drop-dispositions"],
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
					client.emailSecurity.domains.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
