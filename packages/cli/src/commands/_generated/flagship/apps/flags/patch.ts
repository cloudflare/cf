import operation from "../../../_operations/flagship/apps/flags/patch.js";
/**
 * patch command
 * @generated from apis/overlays/flagship.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
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
	command: "patch <flag-key>",
	describe: "Partially update flag",
	usage:
		"$0 flagship apps flags patch <flag-key>\n\nApplies a partial update to lightweight flag fields: `enabled`, `description`, `metadata`, and `default_variation`. Only fields present in the request body are modified; omitted fields are preserved. `metadata: null` or an empty object clears metadata. `default_variation` must exist in the current `variations`. Structural changes to `variations` and `rules` use PUT. A changelog entry is appended when the flag content actually changes.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
		"default-variation": {
			kind: "parsed",
			brief:
				"Variation the API serves when the flag is off, or when it's on but no rule matches the context. Must be a key in `variations`.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"Optional operator-facing description. It does not affect flag evaluation.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"When false, the flag bypasses all rules and always serves `default_variation`.",
			optional: true,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Key-value metadata associated with the flag. `null` or an empty object clears existing metadata; omission semantics depend on the endpoint (PUT clears it, PATCH preserves it). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (boolean | string | number)}.',
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
		{
			placeholder: "flag-key",
			brief: "Case-sensitive key identifying the flag within the app.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags patch",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf flagship apps flags patch",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags/${argv["flag-key"] == null ? "<flag-key>" : encodeURIComponent(String(argv["flag-key"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"flag-key": String(argv["flag-key"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											default_variation: resolveFileToken(
												argv["default-variation"] as string | undefined,
												"default-variation",
												"text"
											),
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											enabled: argv["enabled"],
											metadata: parseJsonMap(argv["metadata"], "metadata"),
										},
										[["metadata"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							flag_key: argv["flag-key"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						default_variation: resolveFileToken(
							argv["default-variation"] as string | undefined,
							"default-variation",
							"text"
						),
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						enabled: argv["enabled"],
						metadata: parseJsonMap(argv["metadata"], "metadata"),
					},
					[["metadata"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						flag_key: argv["flag-key"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
