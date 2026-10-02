import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/flagship.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
			"$0 flagship apps flags update <flag-key>\n\nReplaces the entire flag definition. Omitted fields are dropped, not preserved — read before writing. The path key identifies the flag and cannot be renamed by changing the body `key`. Each update appends a changelog entry."
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
		.option("key", {
			type: "string",
			description:
				"Unique identifier for the flag within an app. Used in all evaluation and SDK calls.",
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

type Request = SdkRequest<"flagship_update_flag">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <flag-key>",
	describe: "Update flag",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags update",
				classification: {
					safeFlags: ["enabled", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf flagship apps flags update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags/${argv["flag-key"] == null ? "<flag-key>" : encodeURIComponent(String(argv["flag-key"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"flag-key": String(argv["flag-key"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
										rules: parseObjectArray(argv["rules"], "rules"),
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.flagship.apps.flags.update({
							...bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							flag_key: argv["flag-key"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					rules: parseObjectArray(argv["rules"], "rules"),
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.flagship.apps.flags.update({
						...bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						flag_key: argv["flag-key"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
