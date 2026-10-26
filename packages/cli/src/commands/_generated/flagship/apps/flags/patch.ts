import operation from "../../../_operations/flagship/apps/flags/patch.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * patch command
 * @generated from apis/overlays/flagship.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 flagship apps flags patch <flag-key>\n\nApplies a partial update to lightweight flag fields: `enabled`, `description`, `metadata`, and `default_variation`. Only fields present in the request body are modified; omitted fields are preserved. `metadata: null` or an empty object clears metadata. `default_variation` must exist in the current `variations`. Structural changes to `variations` and `rules` use PUT. A changelog entry is appended when the flag content actually changes."
		)
		.positional("flag-key", {
			type: "string",
			description: "Case-sensitive key identifying the flag within the app.",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "Flagship app ID returned when the app was created.",
			demandOption: true,
		})
		.option("default-variation", {
			type: "string",
			description:
				"Variation the API serves when the flag is off, or when it's on but no rule matches the context. Must be a key in `variations`.",
		})
		.option("description", {
			type: "string",
			description:
				"Optional operator-facing description. It does not affect flag evaluation.",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"When false, the flag bypasses all rules and always serves `default_variation`.",
		})
		.option("metadata", {
			type: "string",
			description:
				"Key-value metadata associated with the flag. `null` or an empty object clears existing metadata; omission semantics depend on the endpoint (PUT clears it, PATCH preserves it). Provide as a JSON object or @path/to/file.json.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "patch <flag-key>",
	describe: "Partially update flag",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags patch",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
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
};

export default command;
