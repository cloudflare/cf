import operation from "../../_operations/organizations/shares/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/organizations.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 organizations shares list\n\nLists all organization shares.")
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
			description: "Page number. Defaults to `1` when omitted.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of objects to return per page. Defaults to `20` when omitted.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List organization shares",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations shares list",
				classification: {
					safeFlags: ["status", "order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					status: argv["status"],
					order: argv["order"],
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations shares list",
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
					client.send(operation, {
						organization_id: argv["organization-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
