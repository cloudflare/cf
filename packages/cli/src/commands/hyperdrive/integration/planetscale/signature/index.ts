import { ensurePlanetScaleSetupScope } from "./oauth.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { withTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 hyperdrive integration planetscale signature\n\nReturns a short-lived signed authorization for creating a database that is billed through Cloudflare. The caller passes these values to the integration partner's own CLI, which verifies the signature before creating the database. Requires the account to be entitled to Cloudflare-billed databases for the integration."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;
type Request = SdkRequest<"create-hyperdrive-database-signature">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "signature",
	describe: "Create Database Signature",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.dryRun) {
			const accountId = await resolveAccountIdSilent();
			formatDryRun({
				command: "cf hyperdrive integration planetscale signature",
				method: "POST",
				url: `https://api.cloudflare.com/client/v4/accounts/${accountId ?? "<account-id>"}/hyperdrive/integrationsOperations/planetScale/createDatabaseSignature`,
				pathParams: {},
				bodyKind: "none",
			});
			return;
		}

		if (!argv.local) {
			await ensurePlanetScaleSetupScope(argv.quiet);
		}
		const client = await createCommandClient(argv);
		const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
		argv.accountId = accountId;

		const result = await withProgress("Creating", async () =>
			client.hyperdrive.createDatabaseSignature({
				account_id: accountId,
			} satisfies Request)
		);
		formatOutput(result, { successLabel: "Created" });
	},
};

export default withTelemetry(command, {
	command: "hyperdrive integration planetscale signature",
	classification: {
		safeFlags: ["dry-run"],
	} satisfies ArgClassification<Args>,
});
