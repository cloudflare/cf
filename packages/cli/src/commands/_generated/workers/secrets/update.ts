import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
import { compactBody, parseBody } from "#lib/body-parser.js";
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
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("format", {
			type: "string",
			description:
				"Data format of the key. [Learn more](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#format).",
			choices: ["raw", "pkcs8", "spki", "jwk"],
		})
		.coerce("format", (value: string | undefined) =>
			resolveFileToken(value, "format", "text")
		)
		.option("key-base64", {
			type: "string",
			description:
				'Base64-encoded key data. Required if `format` is "raw", "pkcs8", or "spki".',
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
		.conflicts("text", ["format", "key-base64", "usages"])
		.conflicts("format", ["text"])
		.implies("format", ["usages"])
		.conflicts("key-base64", ["text"])
		.conflicts("usages", ["text"])
		.implies("usages", ["format"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"worker-put-script-secret">;
type Body = Request["body"];

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
								: compactBody({
										text: resolveFileToken(
											argv["text"] as string | undefined,
											"text",
											"text"
										),
										type: argv["type"],
										format: argv["format"],
										key_base64: resolveFileToken(
											argv["key-base64"] as string | undefined,
											"key-base64",
											"text"
										),
										usages: argv["usages"],
										name: argv["name"],
									}),
						sensitiveBodyPaths: [["text"], ["key_base64"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;
				const scriptName = getWorkerName({ scriptName: argv["worker"] });
				argv["worker"] = scriptName;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.workers.secrets.update({
							body: bodyData,
							account_id: accountId,
							script_name: scriptName,
						} satisfies Request)
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
				if (argv["type"] === "secret_key") {
					throw new Error(
						"The secret_key variant requires algorithm, which cannot be supplied as flags. Pass --body with a complete request body."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					text: resolveFileToken(
						argv["text"] as string | undefined,
						"text",
						"text"
					),
					type: argv["type"],
					format: argv["format"],
					key_base64: resolveFileToken(
						argv["key-base64"] as string | undefined,
						"key-base64",
						"text"
					),
					usages: argv["usages"],
					name: argv["name"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.workers.secrets.update({
						body: bodyData,
						account_id: accountId,
						script_name: scriptName,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
