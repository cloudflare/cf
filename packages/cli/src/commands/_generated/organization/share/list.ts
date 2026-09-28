import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 organization share list\n\nLists all organization shares.")
		.option("organization-id", {
			type: "string",
			description: "Organization identifier.",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description: "Filter shares by status.",
			choices: ["active", "deleting", "deleted"],
		})
		.option("kind", {
			type: "string",
			description: "Filter shares by kind.",
			choices: ["sent", "received"],
		})
		.option("target-type", {
			type: "string",
			description: "Filter shares by target_type.",
			choices: ["account", "organization"],
		})
		.option("resource-types", {
			type: "string",
			description: "Filter share resources by resource_types.",
		})
		.option("order", {
			type: "string",
			description: "Order shares by values in the given field.",
			choices: ["name", "created"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to sort objects.",
			choices: ["asc", "desc"],
		})
		.option("page", {
			type: "number",
			description:
				"Page number. Defaults to `1` when `per_page` is supplied without\n`page`. May be omitted entirely along with `per_page` to receive a\nnon-paginated response.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of objects to return per page. Defaults to `20` when `page`\nis supplied without `per_page`. May be omitted entirely along with\n`page` to receive a non-paginated response.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"organization-shares-list">;
type Query = SdkQuery<"organization-shares-list">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		kind: Query["kind"];
		"target-type": Query["target_type"];
		"resource-types": Query["resource_types"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List organization shares",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization share list",
				classification: {
					safeFlags: [
						"status",
						"kind",
						"target-type",
						"order",
						"direction",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					status: argv["status"],
					kind: argv["kind"],
					target_type: argv["target-type"],
					resource_types: argv["resource-types"],
					order: argv["order"],
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization share list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/shares`,
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
					client.organization.share.list({
						organization_id: argv["organization-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
