import operation from "../_operations/cps/update.js";
/**
 * update command
 * @generated from apis/overlays/cps.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update communication preferences",
	usage:
		"$0 cps update\n\nSet one or more communication preferences for the authenticated user. Supply a map of preference keys to subscription states, and an optional language locale. This endpoint does not modify email verification settings. Callers authenticate with standard Cloudflare API tokens or keys.",
	flags: {
		"language-locale": {
			kind: "parsed",
			brief:
				"The user's preferred language locale for communications. If omitted, the language locale does not change.",
			optional: true,
			choices: [
				"en-US",
				"es-ES",
				"de-DE",
				"fr-FR",
				"it-IT",
				"ja-JP",
				"ko-KR",
				"pt-BR",
				"zh-CN",
				"zh-TW",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "language-locale", "text"),
		},
		preferences: {
			kind: "parsed",
			brief:
				'Preference keys mapped to subscription states to update. Only the preferences in this map change; others remain unchanged. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
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
			brief:
				"Request body for updating communication preferences. An email field in the payload is ignored; email verification state is managed separately, so the field is excluded from this schema.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cps update",
				classification: {
					safeFlags: ["language-locale", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cps update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/user/communication_preferences`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											"language-locale": argv["language-locale"],
											preferences: parseJsonMap(
												argv["preferences"],
												"preferences"
											),
										},
										[["preferences"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						"language-locale": argv["language-locale"],
						preferences: parseJsonMap(argv["preferences"], "preferences"),
					},
					[["preferences"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
