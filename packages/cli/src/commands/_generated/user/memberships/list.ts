import operation from "../../_operations/user/memberships/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user memberships list\n\nList memberships of accounts the user can access."
		)
		.option("account-name", { type: "string", description: "Account name" })
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of memberships per page.",
		})
		.option("order", {
			type: "string",
			description: "Field to order memberships by.",
			choices: ["id", "account.name", "status"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order memberships.",
			choices: ["asc", "desc"],
		})
		.option("name", { type: "string", description: "Account name" })
		.option("status", {
			type: "string",
			description: "Status of this membership.",
			choices: ["accepted", "pending", "rejected"],
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
	describe: "List Memberships",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user memberships list",
				classification: {
					safeFlags: ["order", "direction", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					"account.name": argv["account-name"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					name: argv["name"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user memberships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/memberships`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
