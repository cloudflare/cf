import operation from "../_operations/rulesets/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "rulesets create",
			classification: {
				safeFlags: ["validate-only", "kind", "phase", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				dry_run: argv["validate-only"],
			};
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The human-readable name of the ruleset."
					);
				}
				if (argv["kind"] === undefined) {
					argv["kind"] = await promptForRequiredEnumField(
						"kind",
						"The kind of the ruleset.",
						["managed", "custom", "root", "zone"] as const
					);
				}
				if (argv["phase"] === undefined) {
					argv["phase"] = await promptForRequiredEnumField(
						"phase",
						"The phase of the ruleset.",
						[
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
							"http_response_firewall_custom",
							"http_response_firewall_managed",
							"http_response_headers_transform",
							"magic_transit",
							"magic_transit_ids_managed",
							"magic_transit_managed",
							"magic_transit_ratelimit",
						] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId =
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
				formatDryRun({
					command: "cf rulesets create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
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
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
			const accountOrZoneId =
				accountOrZone === "zones"
					? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
					: argv.local
						? LOCAL_ACCOUNT_ID
						: await getAccountId();
			if (accountOrZone === "zones") {
				argv.zoneId = accountOrZoneId;
			} else {
				argv.accountId = accountOrZoneId;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_or_zone: accountOrZone,
					account_or_zone_id: accountOrZoneId,
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
