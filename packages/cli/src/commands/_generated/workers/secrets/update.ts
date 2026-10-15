import operation from "../../_operations/workers/secrets/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/workers.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 workers secrets update <name>\n\nAdd a secret to a Worker script by creating a new version with that secret. When changing more than one secret at a time, prefer the "Patch multiple script secrets" API instead of changing many secrets individually.'
		)
		.positional("name", {
			type: "string",
			description: "A JavaScript variable name for the binding.",
			demandOption: true,
		})
		.option("worker", {
			type: "string",
			alias: "script-name",
			description: "Name of the script.",
		})
		.option("text", { type: "string", description: "The secret value to use." })
		.option("type", {
			type: "string",
			description: "The kind of resource that the binding provides.",
			choices: ["secret_text", "secret_key"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("algorithm", {
			type: "string",
			description:
				"Algorithm-specific key parameters. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#algorithm). Provide as a JSON object or @path/to/file.json.",
		})
		.option("format", {
			type: "string",
			description:
				"Data format of the key. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#format).",
			choices: ["raw", "pkcs8", "spki", "jwk"],
		})
		.coerce("format", (value) => resolveFileToken(value, "format", "text"))
		.option("key-base64", {
			type: "string",
			description:
				'Base64-encoded key data. Required if `format` is "raw", "pkcs8", or "spki".',
		})
		.option("key-jwk", {
			type: "string",
			description:
				'Key data in [JSON Web Key](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#json_web_key) format. Required if `format` is "jwk". Provide as a JSON object or @path/to/file.json.',
		})
		.option("usages", {
			type: "string",
			array: true,
			description:
				"Allowed operations with the key. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#keyUsages).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "A secret value accessible through a binding.",
		})
		.conflicts("text", [
			"algorithm",
			"format",
			"key-base64",
			"key-jwk",
			"usages",
		])
		.conflicts("algorithm", ["text"])
		.implies("algorithm", ["format", "usages"])
		.conflicts("format", ["text"])
		.implies("format", ["algorithm", "usages"])
		.conflicts("key-base64", ["text"])
		.conflicts("key-jwk", ["text"])
		.conflicts("usages", ["text"])
		.implies("usages", ["algorithm", "format"]);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <name>",
	describe: "Add a secret to a Worker script",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers secrets update",
				classification: {
					safeFlags: ["type", "format", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers secrets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/scripts/${argv["worker"] ?? "<worker>"}/secrets`,
						pathParams: { "script-name": String(argv["script-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											text: resolveFileToken(
												argv["text"] as string | undefined,
												"text",
												"text"
											),
											type: argv["type"],
											algorithm: parseJsonMap(argv["algorithm"], "algorithm"),
											format: argv["format"],
											key_base64: resolveFileToken(
												argv["key-base64"] as string | undefined,
												"key-base64",
												"text"
											),
											key_jwk: parseJsonMap(argv["key-jwk"], "key-jwk"),
											usages: argv["usages"],
											name: argv["name"],
										},
										[["algorithm"], ["key_jwk"]]
									),
						sensitiveBodyPaths: [["text"], ["key_base64"], ["key_jwk"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;
				const scriptName = getWorkerName({ scriptName: argv["worker"] });
				argv["worker"] = scriptName;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							script_name: scriptName,
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The kind of resource that the binding provides.",
						["secret_text", "secret_key"] as const
					);
				}

				if (argv["type"] === "secret_text" && argv["text"] === undefined) {
					argv["text"] = await promptForRequiredField(
						"text",
						"The secret value to use.",
						{ kind: "secret", question: "Enter value for --text" }
					);
				}
				if (argv["type"] === "secret_key" && argv["algorithm"] === undefined) {
					throw new Error(
						"--algorithm is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === "secret_key" && argv["format"] === undefined) {
					argv["format"] = await promptForRequiredField(
						"format",
						"Data format of the key. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#format).",
						{ question: "Enter value for --format" }
					);
				}
				if (argv["type"] === "secret_key" && argv["usages"] === undefined) {
					throw new Error(
						"--usages is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						text: resolveFileToken(
							argv["text"] as string | undefined,
							"text",
							"text"
						),
						type: argv["type"],
						algorithm: parseJsonMap(argv["algorithm"], "algorithm"),
						format: argv["format"],
						key_base64: resolveFileToken(
							argv["key-base64"] as string | undefined,
							"key-base64",
							"text"
						),
						key_jwk: parseJsonMap(argv["key-jwk"], "key-jwk"),
						usages: argv["usages"],
						name: argv["name"],
					},
					[["algorithm"], ["key_jwk"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						script_name: scriptName,
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
