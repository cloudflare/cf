import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/rulesets.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 rulesets update <ruleset-id>\n\nUpdates an account or zone ruleset, creating a new version."
		)
		.positional("ruleset-id", {
			type: "string",
			description: "The unique ID of the ruleset.",
			demandOption: true,
		})
		.option("validate-only", {
			type: "boolean",
			description:
				"Validates the request without persisting changes when set to `true`. Responses that normally return 200 return `result: null`; endpoints that normally return 204 continue to return 204.",
		})
		.option("description", {
			type: "string",
			description: "An informative description of the ruleset.",
		})
		.option("name", {
			type: "string",
			description: "The human-readable name of the ruleset.",
		})
		.option("kind", {
			type: "string",
			description: "The kind of the ruleset.",
			choices: ["managed", "custom", "root", "zone"],
		})
		.coerce("kind", (value: string | undefined) =>
			resolveFileToken(value, "kind", "text")
		)
		.option("phase", {
			type: "string",
			description: "The phase of the ruleset.",
			choices: [
				"ddos_l4",
				"ddos_l7",
				"http_config_settings",
				"http_custom_errors",
				"http_log_custom_fields",
				"http_ratelimit",
				"http_request_cache_settings",
				"http_request_dynamic_redirect",
				"http_request_firewall_custom",
				"http_request_firewall_managed",
				"http_request_late_transform",
				"http_request_origin",
				"http_request_redirect",
				"http_request_sanitize",
				"http_request_sbfm",
				"http_request_transform",
				"http_response_cache_settings",
				"http_response_compression",
				"http_response_firewall_managed",
				"http_response_headers_transform",
				"magic_transit",
				"magic_transit_ids_managed",
				"magic_transit_managed",
				"magic_transit_ratelimit",
			],
		})
		.coerce("phase", (value: string | undefined) =>
			resolveFileToken(value, "phase", "text")
		)
		.option("rules", {
			type: "string",
			description:
				"The list of rules in the ruleset. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:put:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}">;
type Body = Request;
type Query =
	SdkQuery<"generated:put:/{account_or_zone}/{account_or_zone_id}/rulesets/{ruleset_id}">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <ruleset-id>",
	describe: "Update an account or zone ruleset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rulesets update",
				classification: {
					safeFlags: ["validate-only", "kind", "phase", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					dry_run: argv["validate-only"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf rulesets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/${argv["ruleset-id"] == null ? "<ruleset-id>" : encodeURIComponent(String(argv["ruleset-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"ruleset-id": String(argv["ruleset-id"] ?? ""),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										kind: argv["kind"],
										phase: argv["phase"],
										rules: parseObjectArray(argv["rules"], "rules"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						client.rulesets.update({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							ruleset_id: argv["ruleset-id"],
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					kind: argv["kind"],
					phase: argv["phase"],
					rules: parseObjectArray(argv["rules"], "rules"),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Updating`, async () =>
					client.rulesets.update({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						ruleset_id: argv["ruleset-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
