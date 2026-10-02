import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/containers.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 containers applications instances list\n\nLists container instances belonging to an application."
		)
		.option("application-id", {
			type: "string",
			description:
				"An Application ID represents an identifier of an application.",
			demandOption: true,
		})
		.option("per-page", {
			type: "number",
			description:
				"Maximum number of instances to return per page. Defaults to 100.",
		})
		.option("page-token", {
			type: "string",
			description:
				"Opaque token from a previous response to retrieve the next page.",
		})
		.option("state", {
			type: "string",
			description:
				"Filters instances by lifecycle state. `active` includes provisioning, running, and stopping instances; `not-active` includes stopped and failed instances. When omitted, all instances are returned.",
			choices: ["active", "not-active"],
		})
		.option("name-prefix", {
			type: "string",
			description:
				"Filter instances by a case-sensitive name prefix, falling back to the actor ID when no name is known. Keep the same prefix when using a page token.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"listContainerInstances_v2">;
type Query = SdkQuery<"listContainerInstances_v2">;

const typedBuilder = withArgTypes<
	{
		state: Query["state"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List container instances",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers applications instances list",
				classification: {
					safeFlags: ["state", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					per_page: argv["per-page"],
					page_token: argv["page-token"],
					state: argv["state"],
					name_prefix: argv["name-prefix"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers applications instances list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications/${argv["application-id"] == null ? "<application-id>" : encodeURIComponent(String(argv["application-id"]))}/instances-v2`,
						pathParams: {
							"application-id": String(argv["application-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.containers.applications.instances.list({
						account_id: accountId,
						application_id: argv["application-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
