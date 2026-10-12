import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/mcp.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mcp portals create\n\nCreates a new MCP portal for managing AI tool access through Cloudflare Access."
		)
		.option("allow-code-mode", {
			type: "boolean",
			description:
				"Deprecated: use `code_mode` for new integrations. `true` maps to any non-off Code Mode policy; `false` maps to `code_mode: off`. If both fields are sent, they must be consistent or the request returns a 400.",
		})
		.option("code-mode", {
			type: "string",
			description:
				"Code Mode policy for this portal. `off`: Code Mode is unavailable; query parameters are ignored. `opt_in`: Code Mode is off by default; clients turn it on with `?codemode=search_and_execute`. `default_on`: Code Mode is on by default; clients can opt out with `?codemode=off`. `enforced`: Code Mode is always on; query parameters are ignored. Defaults to `opt_in` when omitted on create. If both `code_mode` and `allow_code_mode` are sent, they must be consistent or the request returns a 400.",
			choices: ["off", "opt_in", "default_on", "enforced"],
		})
		.coerce("code-mode", (value) =>
			resolveFileToken(value, "code-mode", "text")
		)
		.option("description", {
			type: "string",
			description: "Optional description of the MCP portal.",
		})
		.option("hostname", {
			type: "string",
			description: "Hostname where the MCP portal is available.",
		})
		.option("id", {
			type: "string",
			description: "Unique identifier for the MCP portal.",
		})
		.option("name", {
			type: "string",
			description: "Display name for the MCP portal.",
		})
		.option("secure-web-gateway", {
			type: "boolean",
			description:
				"Route outbound MCP traffic through Zero Trust Secure Web Gateway.",
			default: false,
		})
		.option("servers", {
			type: "string",
			description:
				"MCP servers attached to the portal and their portal-specific settings. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"mcp-portals-api-create-portals">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new MCP Portal",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.mcp.portals.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.mcp.portals.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
