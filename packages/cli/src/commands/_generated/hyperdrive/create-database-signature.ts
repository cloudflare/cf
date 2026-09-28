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
 * create-database-signature command
 * @generated from apis/overlays/hyperdrive.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 hyperdrive create-database-signature <integration>\n\nReturns a short-lived signed authorization for creating a database that is billed through Cloudflare. The caller passes these values to the integration partner's own CLI, which verifies the signature before creating the database. Requires the account to be entitled to Cloudflare-billed databases for the integration."
		)
		.positional("integration", {
			type: "string",
			description:
				"The database integration to authorize against. This value is case-insensitive.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"create-hyperdrive-database-signature">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create-database-signature <integration>",
	describe: "Create Database Signature",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "hyperdrive create-database-signature",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf hyperdrive create-database-signature",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/hyperdrive/integrationsOperations/${argv["integration"] == null ? "<integration>" : encodeURIComponent(String(argv["integration"]))}/createDatabaseSignature`,
						pathParams: { integration: String(argv["integration"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					client.hyperdrive.createDatabaseSignature({
						account_id: accountId,
						integration: argv["integration"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
