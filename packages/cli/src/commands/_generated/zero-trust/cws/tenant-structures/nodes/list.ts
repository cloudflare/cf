import operation from "../../../../_operations/zero-trust/cws/tenant-structures/nodes/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust cws tenant-structures nodes list\n\nReturns a paginated list of nodes in the tenant structure."
		)
		.option("structure-id", {
			type: "string",
			description: "ID of the parent tenant structure",
			demandOption: true,
		})
		.option("cursor", {
			type: "string",
			description: "Pagination cursor from previous response",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page (1-100, default 20)",
		})
		.option("order", {
			type: "string",
			description: "Field to order results by (default: created_at)",
			choices: ["name", "created_at", "updated_at"],
		})
		.option("direction", {
			type: "string",
			description: "Sort direction (default: asc)",
			choices: ["asc", "desc"],
		})
		.option("node-kind", {
			type: "string",
			description: "Filter by exact node kind",
		})
		.option("native-id", {
			type: "string",
			description: "Filter by exact cloud-native identifier",
		})
		.option("name", {
			type: "string",
			description: "Filter by node name (case-insensitive substring match)",
		})
		.option("parent", {
			type: "string",
			description: "Filter by exact parent native ID",
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
	describe: "List nodes for a tenant structure",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws tenant-structures nodes list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					node_kind: argv["node-kind"],
					native_id: argv["native-id"],
					name: argv["name"],
					parent: argv["parent"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws tenant-structures nodes list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/tenant-structures/${argv["structure-id"] == null ? "<structure-id>" : encodeURIComponent(String(argv["structure-id"]))}/nodes`,
						pathParams: { "structure-id": String(argv["structure-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						structure_id: argv["structure-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
