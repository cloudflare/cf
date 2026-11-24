import operation from "../../_operations/ai-gateway/custom-providers/create.js";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
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
	describe: "Create a custom provider",
	usage:
		"$0 ai-gateway custom-providers create\n\nCreates an account-level custom provider that forwards AI Gateway requests to the HTTPS base URL you supply. Requests reference the provider as `custom-{slug}`, so the slug must be unique within the account.",
	flags: {
		"base-url": {
			kind: "parsed",
			brief: "The base_url field",
			optional: true,
			parse: String,
		},
		beta: { kind: "boolean", brief: "The beta field", optional: true },
		"curl-example": {
			kind: "parsed",
			brief: "The curl_example field",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enable: { kind: "boolean", brief: "The enable field", optional: true },
		headers: {
			kind: "parsed",
			brief:
				"JSON object of extra HTTP headers that AI Gateway sends to the provider. Values can contain credentials.",
			optional: true,
			parse: String,
		},
		"js-example": {
			kind: "parsed",
			brief: "The js_example field",
			optional: true,
			parse: String,
		},
		link: {
			kind: "parsed",
			brief: "The link field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		position: {
			kind: "parsed",
			brief: "The position field",
			optional: true,
			parse: Number,
		},
		slug: {
			kind: "parsed",
			brief: "The slug field",
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
				command: "ai-gateway custom-providers create",
				classification: {
					safeFlags: ["beta", "enable", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["base-url"] === undefined) {
						argv["base-url"] = await promptForRequiredField(
							"base-url",
							"The base_url field"
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
					if (argv["slug"] === undefined) {
						argv["slug"] = await promptForRequiredField(
							"slug",
							"The slug field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway custom-providers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/custom-providers`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										base_url: resolveFileToken(
											argv["base-url"] as string | undefined,
											"base-url",
											"text"
										),
										beta: argv["beta"],
										curl_example: resolveFileToken(
											argv["curl-example"] as string | undefined,
											"curl-example",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enable: argv["enable"],
										headers: resolveFileToken(
											argv["headers"] as string | undefined,
											"headers",
											"text"
										),
										js_example: resolveFileToken(
											argv["js-example"] as string | undefined,
											"js-example",
											"text"
										),
										link: resolveFileToken(
											argv["link"] as string | undefined,
											"link",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										position: argv["position"],
										slug: resolveFileToken(
											argv["slug"] as string | undefined,
											"slug",
											"text"
										),
									}),
						sensitiveBodyPaths: [["headers"]],
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
					base_url: resolveFileToken(
						argv["base-url"] as string | undefined,
						"base-url",
						"text"
					),
					beta: argv["beta"],
					curl_example: resolveFileToken(
						argv["curl-example"] as string | undefined,
						"curl-example",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enable: argv["enable"],
					headers: resolveFileToken(
						argv["headers"] as string | undefined,
						"headers",
						"text"
					),
					js_example: resolveFileToken(
						argv["js-example"] as string | undefined,
						"js-example",
						"text"
					),
					link: resolveFileToken(
						argv["link"] as string | undefined,
						"link",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					position: argv["position"],
					slug: resolveFileToken(
						argv["slug"] as string | undefined,
						"slug",
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
