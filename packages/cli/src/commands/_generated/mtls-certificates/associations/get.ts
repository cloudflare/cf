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
 * get command
 * @generated from apis/overlays/mtls-certificates.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mtls-certificates associations get <mtls-certificate-id>\n\nLists all active associations between the certificate and Cloudflare services."
		)
		.positional("mtls-certificate-id", {
			type: "string",
			description: "Certificate identifier tag.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"m-tls-certificate-management-list-m-tls-certificate-associations">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <mtls-certificate-id>",
	describe: "List mTLS certificate associations",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mtls-certificates associations get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mtls-certificates associations get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mtls_certificates/${argv["mtls-certificate-id"] == null ? "<mtls-certificate-id>" : encodeURIComponent(String(argv["mtls-certificate-id"]))}/associations`,
						pathParams: {
							"mtls-certificate-id": String(argv["mtls-certificate-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.mtlsCertificates.associations.get({
						account_id: accountId,
						mtls_certificate_id: argv["mtls-certificate-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
