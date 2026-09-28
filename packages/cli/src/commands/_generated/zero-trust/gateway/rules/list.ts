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
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust gateway rules list\n\nList Zero Trust Gateway rules for an account."
		)
		.option("filter", {
			type: "string",
			description:
				"Filter the returned rules by one or more `field:value` pairs. Repeat the\nparameter to combine filters with logical AND.\n\nSupported fields are `name`, `id`, `action`, `enabled`, `source_account`,\n`is_shared`, `filters`, and `expression` (max 1024 bytes). The `source_account`\nvalue is matched as a normalized UUID substring. The `filters` value must\nbe one of the rule filter names and matches a member of the rule's `filters`\narray. The `expression` filter performs a case-insensitive literal\nsubstring match across traffic, identity, and device posture expressions.",
		})
		.option("search", {
			type: "string",
			description:
				"Case-insensitive substring search across rule name and description.",
		})
		.option("order-by", {
			type: "string",
			description:
				"Field to sort the returned rules by. Supported values are `name`,\n`created_at`, `updated_at`, and `precedence`.",
			choices: ["name", "created_at", "updated_at", "precedence"],
		})
		.option("direction", {
			type: "string",
			description:
				"Sort direction. When `order_by` is omitted, this controls the direction\nof the existing precedence ordering. Shared rules remain first in either\ndirection. Accepted values are `asc` and `desc`.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"zero-trust-gateway-rules-list-zero-trust-gateway-rules">;
type Query = SdkQuery<"zero-trust-gateway-rules-list-zero-trust-gateway-rules">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["order_by"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Zero Trust Gateway rules",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway rules list",
				classification: {
					safeFlags: ["order-by", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					filter: argv["filter"],
					search: argv["search"],
					order_by: argv["order-by"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/rules`,
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
					client.zeroTrust.gateway.rules.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
