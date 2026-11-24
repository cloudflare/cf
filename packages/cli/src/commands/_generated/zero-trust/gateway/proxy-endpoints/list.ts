import operation from "../../../_operations/zero-trust/gateway/proxy-endpoints/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "List proxy endpoints",
	usage:
		"$0 zero-trust gateway proxy-endpoints list\n\nList all Zero Trust Gateway proxy endpoints for an account.",
	flags: {
		filter: {
			kind: "parsed",
			brief:
				"Filter the returned proxy endpoints by one or more `field:value` pairs.\nRepeat the parameter to apply multiple filters; they are combined with\nlogical AND (an endpoint must satisfy every filter to be returned).\n\nSupported fields and their matching behaviour:\n  * `name` — case-insensitive substring match on the endpoint name.\n  * `id` — substring match on the endpoint ID (UUID), with or without dashes.\n  * `kind` — exact match on the endpoint kind. The value must be `ip` or `identity`; any other value returns `400`.\n\nEach entry must match one of the per-field patterns below: the field\nmust be one of `name`, `id`, or `kind`; `name`/`id` accept any value,\nwhile `kind` only accepts `ip` or `identity`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Case-insensitive substring match on the endpoint name. When combined\nwith `filter`, both must match (logical AND).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort the returned endpoints by. When omitted, the order of\nresults is unspecified. Supported values:\n  * `name` — sort alphabetically by endpoint name.\n  * `created_at` — sort by creation time; defaults to descending unless `direction` is set.\n  * `updated_at` — sort by last-modified time; defaults to descending unless `direction` is set.",
			values: ["name", "created_at", "updated_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort direction. Only takes effect when `order_by` is also provided; it\nis ignored otherwise. When `direction` is omitted the effective\ndirection is field-specific: `created_at` and `updated_at` default to\ndescending (newest first); `name` defaults to ascending.\n  * `asc` — ascending.\n  * `desc` — descending.",
			values: ["asc", "desc"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway proxy-endpoints list",
				classification: {
					safeFlags: ["order-by", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
