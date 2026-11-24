import operation from "../../../_operations/zero-trust/access/custom-pages/create.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a custom page",
	usage: "$0 zero-trust access custom-pages create\n\nCreate a custom page",
	flags: {
		"app-count": {
			kind: "parsed",
			brief: "Number of apps the custom page is assigned to.",
			optional: true,
			parse: Number,
		},
		"contract-version": {
			kind: "parsed",
			brief:
				"Contract version of the page's Liquid template. Present (>= 1) marks a sanitized template; absent or 0 marks a legacy page served verbatim.",
			optional: true,
			parse: Number,
		},
		"created-at": {
			kind: "parsed",
			brief: "The created_at field",
			optional: true,
			parse: String,
		},
		"custom-html": {
			kind: "parsed",
			brief: "Custom page HTML.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Custom page name.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Custom page type.",
			optional: true,
			choices: ["identity_denied", "forbidden", "login", "interstitial"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		uid: { kind: "parsed", brief: "UUID.", optional: true, parse: String },
		"updated-at": {
			kind: "parsed",
			brief: "The updated_at field",
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
				command: "zero-trust access custom-pages create",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["custom-html"] === undefined) {
						argv["custom-html"] = await promptForRequiredField(
							"custom-html",
							"Custom page HTML."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Custom page name."
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"Custom page type.",
							["identity_denied", "forbidden", "login", "interstitial"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access custom-pages create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/custom_pages`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										app_count: argv["app-count"],
										contract_version: argv["contract-version"],
										created_at: resolveFileToken(
											argv["created-at"] as string | undefined,
											"created-at",
											"text"
										),
										custom_html: resolveFileToken(
											argv["custom-html"] as string | undefined,
											"custom-html",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										type: argv["type"],
										uid: resolveFileToken(
											argv["uid"] as string | undefined,
											"uid",
											"text"
										),
										updated_at: resolveFileToken(
											argv["updated-at"] as string | undefined,
											"updated-at",
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
					app_count: argv["app-count"],
					contract_version: argv["contract-version"],
					created_at: resolveFileToken(
						argv["created-at"] as string | undefined,
						"created-at",
						"text"
					),
					custom_html: resolveFileToken(
						argv["custom-html"] as string | undefined,
						"custom-html",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					type: argv["type"],
					uid: resolveFileToken(
						argv["uid"] as string | undefined,
						"uid",
						"text"
					),
					updated_at: resolveFileToken(
						argv["updated-at"] as string | undefined,
						"updated-at",
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
