import operation from "../../_operations/kv/namespaces/create.js";
/**
 * create command
 * @generated from apis/overlays/kv.ts
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
	describe: "Create a namespace",
	usage:
		"$0 kv namespaces create\n\nCreates a Workers KV namespace in the specified account with the given title. Returns `400` if the account already owns a namespace with that title; an existing namespace must be explicitly deleted before it can be replaced. An optional jurisdiction restricts where data is durably stored and can only be set at creation time.",
	flags: {
		jurisdiction: {
			kind: "parsed",
			brief:
				"Specify the jurisdiction to restrict the KV namespace to durably store data within. Can only be set at namespace creation time.",
			optional: true,
			choices: ["eu", "fedramp", "us"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		"namespace-mode": {
			kind: "parsed",
			brief:
				"The mode of the Workers KV namespace. Specify `instant` when creating a namespace to create a KV Instant namespace. Omit this field when creating a namespace to create a classic namespace. Currently, `instant` is the only supported explicit value.",
			optional: true,
			choices: ["instant"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "namespace-mode", "text"),
		},
		title: {
			kind: "parsed",
			brief: "Human-readable string name for a Workers KV namespace.",
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
				command: "kv namespaces create",
				classification: {
					safeFlags: ["jurisdiction", "namespace-mode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["title"] === undefined) {
						argv["title"] = await promptForRequiredField(
							"title",
							"Human-readable string name for a Workers KV namespace."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv namespaces create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										jurisdiction: argv["jurisdiction"],
										mode: argv["namespace-mode"],
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
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
					jurisdiction: argv["jurisdiction"],
					mode: argv["namespace-mode"],
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
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
