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
			"$0 zero-trust gateway proxy-endpoints list\n\nList all Zero Trust Gateway proxy endpoints for an account."
		)
		.option("filter", {
			type: "string",
			description:
				"Filter the returned proxy endpoints by one or more `field:value` pairs.\nRepeat the parameter to apply multiple filters; they are combined with\nlogical AND (an endpoint must satisfy every filter to be returned).\n\nSupported fields and their matching behaviour:\n  * `name` — case-insensitive substring match on the endpoint name.\n  * `id` — substring match on the endpoint ID (UUID), with or without dashes.\n  * `kind` — exact match on the endpoint kind. The value must be `ip` or `identity`; any other value returns `400`.\n\nEach entry must match one of the per-field patterns below: the field\nmust be one of `name`, `id`, or `kind`; `name`/`id` accept any value,\nwhile `kind` only accepts `ip` or `identity`.",
		})
		.option("search", {
			type: "string",
			description:
				"Case-insensitive substring match on the endpoint name. When combined\nwith `filter`, both must match (logical AND).",
		})
		.option("order-by", {
			type: "string",
			description:
				"Field to sort the returned endpoints by. When omitted, the order of\nresults is unspecified. Supported values:\n  * `name` — sort alphabetically by endpoint name.\n  * `created_at` — sort by creation time; defaults to descending unless `direction` is set.\n  * `updated_at` — sort by last-modified time; defaults to descending unless `direction` is set.",
			choices: ["name", "created_at", "updated_at"],
		})
		.option("direction", {
			type: "string",
			description:
				"Sort direction. Only takes effect when `order_by` is also provided; it\nis ignored otherwise. When `direction` is omitted the effective\ndirection is field-specific: `created_at` and `updated_at` default to\ndescending (newest first); `name` defaults to ascending.\n  * `asc` — ascending.\n  * `desc` — descending.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"zero-trust-gateway-proxy-endpoints-list-proxy-endpoints">;
type Query =
	SdkQuery<"zero-trust-gateway-proxy-endpoints-list-proxy-endpoints">;

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
	describe: "List proxy endpoints",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway proxy-endpoints list",
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
						command: "cf zero-trust gateway proxy-endpoints list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/proxy_endpoints`,
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
					client.zeroTrust.gateway.proxyEndpoints.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
