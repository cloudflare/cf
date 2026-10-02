import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/iam.ts
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
			"$0 iam permission-groups list\n\nList all the permissions groups for an account."
		)
		.option("id", {
			type: "string",
			description: "ID of the permission group to be fetched.",
		})
		.option("name", {
			type: "string",
			description: "Name of the permission group to be fetched.",
		})
		.option("label", {
			type: "string",
			description: "Label of the permission group to be fetched.",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Maximum number of results per page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"account-permission-group-list">;
type Query = SdkQuery<"account-permission-group-list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Account Permission Groups",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "iam permission-groups list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					id: argv["id"],
					name: argv["name"],
					label: argv["label"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam permission-groups list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/iam/permission_groups`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.iam.permissionGroups.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
