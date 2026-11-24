import operation from "../../../_operations/zero-trust/access/service-tokens/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <service-token-id>",
	describe: "Update a service token",
	usage:
		"$0 zero-trust access service-tokens update <service-token-id>\n\nUpdates a configured service token.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"client-secret-version": {
			kind: "parsed",
			brief:
				"A version number identifying the current `client_secret` associated with the service token. Incrementing it triggers a rotation; the previous secret will still be accepted until the time indicated by `previous_client_secret_expires_at`. If the service token was reported as leaked, `previous_client_secret_expires_at` is not required, may not be in the future, and the previous secret is discarded immediately.",
			optional: true,
			parse: Number,
		},
		duration: {
			kind: "parsed",
			brief:
				"The duration for how long the service token will be valid. Must be in the format `300ms` or `2h45m`, or the special value `forever` for non-expiring tokens. Valid time units are: ns, us (or µs), ms, s, m, h. The default is 1 year in hours (8760h).",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether the service token is enabled. A disabled service token cannot be used to authenticate; both its current and previous `client_secret` stop being accepted, but the token itself is preserved and can be re-enabled. A service token reported as leaked is disabled automatically and cannot be re-enabled until its secret is rotated; attempting to do so returns a 409. Defaults to enabled when omitted on create.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name of the service token.",
			optional: true,
			parse: String,
		},
		"previous-client-secret-expires-at": {
			kind: "parsed",
			brief:
				"The expiration of the previous `client_secret`. This can be modified at any point after a rotation. For example, you may extend it further into the future if you need more time to update services with the new secret; or move it into the past to immediately invalidate the previous token in case of compromise. Rotating a service token that was reported as leaked discards the previous secret entirely, so no grace period can be set.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags associated with the service token, as key-value pairs. On update, replaces all existing tags. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "service-token-id", brief: "UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access service-tokens update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf zero-trust access service-tokens update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/access/service_tokens/${argv["service-token-id"] == null ? "<service-token-id>" : encodeURIComponent(String(argv["service-token-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"service-token-id": String(argv["service-token-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											client_secret_version: argv["client-secret-version"],
											duration: resolveFileToken(
												argv["duration"] as string | undefined,
												"duration",
												"text"
											),
											enabled: argv["enabled"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											previous_client_secret_expires_at: resolveFileToken(
												argv["previous-client-secret-expires-at"] as
													| string
													| undefined,
												"previous-client-secret-expires-at",
												"text"
											),
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
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

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							service_token_id: argv["service-token-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						client_secret_version: argv["client-secret-version"],
						duration: resolveFileToken(
							argv["duration"] as string | undefined,
							"duration",
							"text"
						),
						enabled: argv["enabled"],
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						previous_client_secret_expires_at: resolveFileToken(
							argv["previous-client-secret-expires-at"] as string | undefined,
							"previous-client-secret-expires-at",
							"text"
						),
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						service_token_id: argv["service-token-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
