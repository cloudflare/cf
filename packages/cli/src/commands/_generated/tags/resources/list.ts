import operation from "../../_operations/tags/resources/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/tags.ts
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
			"$0 tags resources list\n\nLists all tagged resources for an account."
		)
		.option("include-navigation", {
			type: "boolean",
			description:
				"Resolve current namespace Worker navigation by immutable child tag. Optional read-only navigation is omitted for deleted or unresolved children. Lookups are limited to this page, at most five concurrently, with a shared two-second budget. Tag identity, ETag, filters and pagination are unchanged; name filtering still uses the stored resource name. Defaults to false.",
		})
		.option("type", {
			type: "string",
			description:
				"Filter by resource type. Can be repeated to filter by multiple types (OR logic). Example: ?type=zone&type=worker",
		})
		.option("name", {
			type: "string",
			description:
				"Filter by resource name. Performs a case-insensitive substring match. Example: ?name=my-zone",
		})
		.option("id", {
			type: "string",
			description:
				"Filter by resource ID. Can be repeated up to 50 times to filter by multiple IDs. Example: ?id=abc&id=def",
		})
		.option("case-insensitive", {
			type: "boolean",
			description:
				"Match `tag` keys and values case-insensitively. Stored casing is unchanged. Example: ?tag=environment=production&case_insensitive=true",
		})
		.option("tag", {
			type: "string",
			description:
				"Filter resources by tag criteria. This parameter can be repeated multiple times, with AND logic between parameters.\n\nSupported syntax:\n- **Key-only**: `tag=<key>` - Resource must have the tag key (e.g., `tag=production`)\n- **Key-value**: `tag=<key>=<value>` - Resource must have the tag with specific value (e.g., `tag=env=prod`)\n- **Multiple values (OR)**: `tag=<key>=<v1>,<v2>` - Resource must have tag with any of the values (e.g., `tag=env=prod,staging`)\n- **Negate key-only**: `tag=!<key>` - Resource must not have the tag key (e.g., `tag=!archived`)\n- **Negate key-value**: `tag=<key>!=<value>` - Resource must not have the tag with specific value (e.g., `tag=region!=us-west-1`)\n\nMultiple tag parameters are combined with AND logic.",
		})
		.option("cursor", { type: "string", description: "Cursor for pagination." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tagged resources",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tags resources list",
				classification: {
					safeFlags: ["include-navigation", "case-insensitive", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					include_navigation: argv["include-navigation"],
					type: argv["type"],
					name: argv["name"],
					id: argv["id"],
					case_insensitive: argv["case-insensitive"],
					tag: argv["tag"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tags resources list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/tags/resources`,
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
