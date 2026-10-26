import operation from "../../../_operations/flagship/apps/flags/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/flagship.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 flagship apps flags create <app-id>\n\nCreates a flag. Returns 409 if the key already exists. `type` is always inferred from variation values; legacy request-side values are ignored. Optional `metadata` can be attached at creation."
		)
		.positional("app-id", {
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
		.option("key", {
			type: "string",
			description:
				"Unique identifier for the flag within an app. Used in all evaluation and SDK calls.",
		})
		.option("metadata", {
			type: "string",
			description:
				"Key-value metadata associated with the flag. `null` or an empty object clears existing metadata; omission semantics depend on the endpoint (PUT clears it, PATCH preserves it). Provide as a JSON object or @path/to/file.json.",
		})
		.option("rules", {
			type: "string",
			description:
				"Targeting rules evaluated in ascending `priority`; the first matching rule wins. An empty array means the flag always serves `default_variation`. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("type", {
			type: "string",
			description:
				"Deprecated compatibility field. Omit it; the API ignores this value and infers the type from the flag's variations.",
			choices: ["boolean", "string", "number", "json"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("variations", {
			type: "string",
			description:
				"Map of variation name to value. All values share the same type (boolean, string, number, or JSON object/array), and each serialized value stays within 10KB. Provide as a JSON object or @path/to/file.json.",
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
	command: "create <app-id>",
	describe: "Create flag",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags create",
				classification: {
					safeFlags: ["enabled", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf flagship apps flags create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [
										{ path: ["variations"], flag: "variations" },
									])
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
											key: resolveFileToken(
												argv["key"] as string | undefined,
												"key",
												"text"
											),
											metadata: parseJsonMap(argv["metadata"], "metadata"),
											rules: parseObjectArray(argv["rules"], "rules"),
											type: argv["type"],
											variations: parseJsonMap(
												argv["variations"],
												"variations",
												true
											),
										},
										[["metadata"], ["variations"]]
									),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body, [
						{ path: ["variations"], flag: "variations" },
					]);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["default-variation"] === undefined) {
					argv["default-variation"] = await promptForRequiredField(
						"default-variation",
						"Variation the API serves when the flag is off, or when it's on but no rule matches the context. Must be a key in \`variations\`."
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["key"] === undefined) {
					argv["key"] = await promptForRequiredField(
						"key",
						"Unique identifier for the flag within an app. Used in all evaluation and SDK calls."
					);
				}
				if (argv["rules"] === undefined) {
					throw new Error(
						"--rules is required (or pass --body with this field set)."
					);
				}
				if (argv["variations"] === undefined) {
					throw new Error(
						"--variations is required (or pass --body with this field set)."
					);
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
						key: resolveFileToken(
							argv["key"] as string | undefined,
							"key",
							"text"
						),
						metadata: parseJsonMap(argv["metadata"], "metadata"),
						rules: parseObjectArray(argv["rules"], "rules"),
						type: argv["type"],
						variations: parseJsonMap(argv["variations"], "variations", true),
					},
					[["metadata"], ["variations"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
