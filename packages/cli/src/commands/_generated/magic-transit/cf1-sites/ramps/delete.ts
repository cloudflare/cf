import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit cf1-sites ramps delete <ramp-id>\n\nDeletes a specific ramp from a CF1 Site."
		)
		.positional("ramp-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("cf1-site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"magic-cf1-sites-delete-cf1-site-ramp">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <ramp-id>",
	describe: "Delete CF1 Site Ramp",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit cf1-sites ramps delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit cf1-sites ramps delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cf1_sites/${argv["cf1-site-id"] == null ? "<cf1-site-id>" : encodeURIComponent(String(argv["cf1-site-id"]))}/ramps/${argv["ramp-id"] == null ? "<ramp-id>" : encodeURIComponent(String(argv["ramp-id"]))}`,
						pathParams: {
							"cf1-site-id": String(argv["cf1-site-id"] ?? ""),
							"ramp-id": String(argv["ramp-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.magicTransit.cf1Sites.ramps.delete({
						account_id: accountId,
						cf1_site_id: argv["cf1-site-id"],
						ramp_id: argv["ramp-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
