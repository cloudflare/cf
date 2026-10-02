import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/pages.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pages deployments list\n\nList the production or preview deployments for a Cloudflare Pages project."
		)
		.option("project-name", {
			type: "string",
			description:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			demandOption: true,
		})
		.option("env", {
			type: "string",
			description:
				"Deployment environment to return. Valid values are `production` and `preview`.",
			choices: ["production", "preview"],
		})
		.option("page", {
			type: "number",
			description: "Page number of results to return.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to return per page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"pages-deployment-get-deployments">;
type Query = SdkQuery<"pages-deployment-get-deployments">;

const typedBuilder = withArgTypes<
	{
		env: Query["env"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Pages deployments",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages deployments list",
				classification: {
					safeFlags: ["env", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					env: argv["env"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages deployments list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}/deployments`,
						pathParams: { "project-name": String(argv["project-name"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.pages.deployments.list({
						account_id: accountId,
						project_name: argv["project-name"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
