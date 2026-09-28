import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get-pem command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access saml-certificates get-pem <saml-cert-set-id>\n\nDownloads the current SAML encryption certificate's public key in PEM format for the specified certificate set. This endpoint is useful for providing the certificate to Identity Providers for SAML assertion encryption configuration."
		)
		.positional("saml-cert-set-id", {
			type: "string",
			description: "UID of the SAML certificate set.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"access-saml-certificates-get-pem">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-pem <saml-cert-set-id>",
	describe: "Download current certificate in PEM format",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access saml-certificates get-pem",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access saml-certificates get-pem",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/saml_certificates/${argv["saml-cert-set-id"] == null ? "<saml-cert-set-id>" : encodeURIComponent(String(argv["saml-cert-set-id"]))}/pem`,
						pathParams: {
							"saml-cert-set-id": String(argv["saml-cert-set-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.access.samlCertificates.getPem({
						account_id: accountId,
						saml_cert_set_id: argv["saml-cert-set-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
