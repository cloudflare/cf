import operation from "../../../_operations/flagship/apps/flags/create.js";
/**
 * create command
 * @generated from apis/overlays/flagship.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create <app-id>",
	describe: "Create flag",
	usage:
		"$0 flagship apps flags create <app-id>\n\nCreates a flag. Returns 409 if the key already exists. `type` is always inferred from variation values; legacy request-side values are ignored. Optional `metadata` can be attached at creation.",
	flags: {
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
		key: {
			kind: "parsed",
			brief:
				"Unique identifier for the flag within an app. Used in all evaluation and SDK calls.",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Key-value metadata associated with the flag. `null` or an empty object clears existing metadata; omission semantics depend on the endpoint (PUT clears it, PATCH preserves it). Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (boolean | string | number)}.',
			optional: true,
			parse: String,
		},
		rules: {
			kind: "parsed",
			brief:
				'Targeting rules evaluated in ascending `priority`; the first matching rule wins. An empty array means the flag always serves `default_variation`. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"conditions": [{...}], "priority": number, "serve_variation": string, "rollout"?: {...}}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"Deprecated compatibility field. Omit it; the API ignores this value and infers the type from the flag's variations.",
			optional: true,
			choices: ["boolean", "string", "number", "json"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		variations: {
			kind: "parsed",
			brief:
				'Map of variation name to value. All values share the same type (boolean, string, number, or JSON object/array), and each serialized value stays within 10KB. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": (string | number | boolean | ...more)}.',
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
			placeholder: "app-id",
			brief: "Flagship app ID returned when the app was created.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags create",
				classification: {
					safeFlags: ["enabled", "type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				const parsedBody =
					argv.body !== undefined
						? parseBody(argv.body, [
								{ path: ["variations"], flag: "variations" },
							])
						: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
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
				await resolveRequiredFields();

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
});

export default command;
