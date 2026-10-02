import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one rules list\n\nReturns all rules for an account with optional filtering."
		)
		.option("namespace", {
			type: "string",
			description:
				"Selects namespaces. Repeat the parameter to select multiple namespaces (for example, namespace=foo&namespace=bar).",
		})
		.option("path", {
			type: "string",
			description:
				"Selects paths with exact-match semantics. Omit the parameter to return rules from all paths. Pass an empty string (path=) to return only rules with an empty or uncategorized path. Pass a value (for example, path=yara) to match that exact path. Repeat the parameter (for example, path=yara&path=expr) to OR-match multiple paths with SQL `IN (...)` semantics. The `recursive` flag affects only customer-account namespace selection.",
		})
		.option("recursive", {
			type: "string",
			description:
				"For customer accounts, true enables descendant matching for namespaces. Paths always use exact matching.",
			choices: ["true", "false"],
		})
		.option("search", { type: "string", description: "Search" })
		.option("is-public", {
			type: "string",
			description: "Limits rules to the specified public visibility.",
			choices: ["true", "false"],
		})
		.option("limit", { type: "number", description: "Limit" })
		.option("offset", { type: "number", description: "Offset" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"cloudforce-one-list-rules">;
type Query = SdkQuery<"cloudforce-one-list-rules">;

const typedBuilder = withArgTypes<
	{
		namespace: Query["namespace"];
		path: Query["path"];
		recursive: Query["recursive"];
		"is-public": Query["is_public"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List rules",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules list",
				classification: {
					safeFlags: ["recursive", "is-public", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					namespace: argv["namespace"],
					path: argv["path"],
					recursive: argv["recursive"],
					search: argv["search"],
					is_public: argv["is-public"],
					limit: argv["limit"],
					offset: argv["offset"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules`,
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
					client.cloudforceOne.rules.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
