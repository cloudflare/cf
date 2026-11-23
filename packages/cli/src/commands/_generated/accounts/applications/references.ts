import operation from "../../_operations/accounts/applications/references.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * references command
 * @generated from apis/overlays/accounts.ts
 */
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts applications references <id>\n\nList the resources in the account that reference a custom application, such as Gateway rules. This is the same list a delete of the application returns when it is rejected. A delete checks the references again, so the list can change before the delete runs."
		)
		.positional("id", {
			type: "string",
			description: "Application ID of a custom application in the account.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "references <id>",
	describe: "Get application references",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts applications references",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts applications references",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/resource-library/applications/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/references`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, id: argv["id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
