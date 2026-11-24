import operation from "../../../../_operations/workers-for-platforms/dispatch-namespaces/scripts/secrets/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command:
				"workers-for-platforms dispatch-namespaces scripts secrets update",
			classification: {
				safeFlags: ["type", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A JavaScript variable name for the binding."
					);
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf workers-for-platforms dispatch-namespaces scripts secrets update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/secrets`,
					pathParams: {
						"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
						"script-name": String(argv["script-name"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
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
									},
									[["algorithm"], ["key_jwk"]]
								),
					sensitiveBodyPaths: [["text"], ["key_base64"], ["key_jwk"]],
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
						dispatch_namespace: argv["dispatch-namespace"],
						script_name: argv["script-name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
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
				},
				[["algorithm"], ["key_jwk"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					dispatch_namespace: argv["dispatch-namespace"],
					script_name: argv["script-name"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
