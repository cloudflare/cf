import operation from "../../_operations/mcp/portals/create.js";
/**
 * create command
 * @generated from apis/overlays/mcp.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create a new MCP Portal",
	usage:
		"$0 mcp portals create\n\nCreates a new MCP portal. Each account supports up to 50 portals, including disabled portals.",
	flags: {
		"allow-code-mode": {
			kind: "boolean",
			brief:
				"Deprecated: use `code_mode` for new integrations. `true` maps to any non-off Code Mode policy; `false` maps to `code_mode: off`. If both fields are sent, they must be consistent or the request returns a 400.",
			optional: true,
		},
		"code-mode": {
			kind: "parsed",
			brief:
				"Code Mode policy for this portal. `off`: Code Mode is unavailable; query parameters are ignored. `opt_in`: Code Mode is off by default; clients turn it on with `?codemode=search_and_execute`. `default_on`: Code Mode is on by default; clients can opt out with `?codemode=off`. `enforced`: Code Mode is always on; query parameters are ignored. Defaults to `opt_in` when omitted on create. If both `code_mode` and `allow_code_mode` are sent, they must be consistent or the request returns a 400.",
			optional: true,
			choices: ["off", "opt_in", "default_on", "enforced"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "code-mode", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Optional description of the MCP portal.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "Hostname where the MCP portal is available.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "Unique identifier for the MCP portal.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Display name for the MCP portal.",
			optional: true,
			parse: String,
		},
		"secure-web-gateway": {
			kind: "boolean",
			brief:
				"Route outbound MCP traffic through Zero Trust Secure Web Gateway.",
			default: false,
		},
		servers: {
			kind: "parsed",
			brief:
				'MCP servers attached to the portal and their portal-specific settings. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"server_id": string, "default_disabled"?: boolean, "on_behalf"?: boolean, "updated_prompts"?: [{...}], "updated_tools"?: [{...}]}]. ? marks optional keys.',
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
				command: "mcp portals create",
				classification: {
					safeFlags: [
						"allow-code-mode",
						"code-mode",
						"secure-web-gateway",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["hostname"] === undefined) {
						argv["hostname"] = await promptForRequiredField(
							"hostname",
							"Hostname where the MCP portal is available."
						);
					}
					if (argv["id"] === undefined) {
						argv["id"] = await promptForRequiredField(
							"id",
							"Unique identifier for the MCP portal."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Display name for the MCP portal."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mcp portals create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/ai-controls/mcp/portals`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allow_code_mode: argv["allow-code-mode"],
										code_mode: argv["code-mode"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										secure_web_gateway: argv["secure-web-gateway"],
										servers: parseObjectArray(argv["servers"], "servers"),
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
					allow_code_mode: argv["allow-code-mode"],
					code_mode: argv["code-mode"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					secure_web_gateway: argv["secure-web-gateway"],
					servers: parseObjectArray(argv["servers"], "servers"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
