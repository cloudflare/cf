import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization member list\n\nList memberships for an Organization. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.option("organization-id", {
			type: "string",
			description: "Organization ID",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description: "Filter the list of memberships by membership status.",
		})
		.option("user-email", {
			type: "string",
			description: "Filter the list of memberships for a specific email.",
		})
		.option("user-email-contains", {
			type: "string",
			description:
				"Filter the list of memberships for a specific email that contains a substring.",
		})
		.option("user-email-starts-with", {
			type: "string",
			description:
				"Filter the list of memberships for a specific email that starts with a substring.",
		})
		.option("user-email-ends-with", {
			type: "string",
			description:
				"Filter the list of memberships for a specific email that ends with a substring.",
		})
		.option("page-token", {
			type: "string",
			description:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
		})
		.option("page-size", {
			type: "number",
			description: "The amount of items to return. Defaults to 10.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"Members_list">;
type Query = SdkQuery<"Members_list">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List organization members",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization member list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					status: argv["status"],
					"user.email": argv["user-email"],
					"user.email.contains": argv["user-email-contains"],
					"user.email.startsWith": argv["user-email-starts-with"],
					"user.email.endsWith": argv["user-email-ends-with"],
					page_token: argv["page-token"],
					page_size: argv["page-size"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization member list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.organization.member.list({
						organization_id: argv["organization-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
