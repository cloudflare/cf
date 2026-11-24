import operation from "../../_operations/images/import/create.js";
/**
 * create command
 * @generated from apis/overlays/images.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a sourcing kit migration",
	usage:
		"$0 images import create\n\nCreate a pending CF Images import from a configured source.",
	flags: {
		"conflict-behaviour": {
			kind: "parsed",
			brief: "How to handle objects that already exist at the destination.",
			default: "skip",
			choices: ["skip", "overwrite"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "conflict-behaviour", "text"),
		},
		"excluded-content-types": {
			kind: "parsed",
			brief: "Content types to skip during migration.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"path-prefix": {
			kind: "parsed",
			brief: "Prefix to prepend to image custom IDs.",
			optional: true,
			parse: String,
		},
		"root-directory": {
			kind: "parsed",
			brief: "Only import objects under this prefix in the source bucket.",
			optional: true,
			parse: String,
		},
		"source-id": {
			kind: "parsed",
			brief: "The identifier of the source to migrate from.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images import create",
				classification: {
					safeFlags: ["conflict-behaviour", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["source-id"] === undefined) {
						argv["source-id"] = await promptForRequiredField(
							"source-id",
							"The identifier of the source to migrate from."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images import create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2/sourcingkit/migrations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										conflictBehaviour: argv["conflict-behaviour"],
										excludedContentTypes: argv["excluded-content-types"],
										pathPrefix: resolveFileToken(
											argv["path-prefix"] as string | undefined,
											"path-prefix",
											"text"
										),
										rootDirectory: resolveFileToken(
											argv["root-directory"] as string | undefined,
											"root-directory",
											"text"
										),
										sourceId: resolveFileToken(
											argv["source-id"] as string | undefined,
											"source-id",
											"text"
										),
									}),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					conflictBehaviour: argv["conflict-behaviour"],
					excludedContentTypes: argv["excluded-content-types"],
					pathPrefix: resolveFileToken(
						argv["path-prefix"] as string | undefined,
						"path-prefix",
						"text"
					),
					rootDirectory: resolveFileToken(
						argv["root-directory"] as string | undefined,
						"root-directory",
						"text"
					),
					sourceId: resolveFileToken(
						argv["source-id"] as string | undefined,
						"source-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
