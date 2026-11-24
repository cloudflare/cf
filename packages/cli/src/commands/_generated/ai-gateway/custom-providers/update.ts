import operation from "../../_operations/ai-gateway/custom-providers/update.js";
/**
 * update command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <id>",
	describe: "Update a custom provider",
	usage:
		"$0 ai-gateway custom-providers update <id>\n\nUpdates the specified fields of a custom provider. Changes clear cached entries for the provider.",
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
		logo: {
			kind: "parsed",
			brief: "The logo field",
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
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway custom-providers update",
				classification: {
					safeFlags: ["beta", "enable", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway custom-providers update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/custom-providers/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: { id: String(argv["id"] ?? "") },
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
										logo: resolveFileToken(
											argv["logo"] as string | undefined,
											"logo",
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							id: argv["id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

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
					logo: resolveFileToken(
						argv["logo"] as string | undefined,
						"logo",
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
