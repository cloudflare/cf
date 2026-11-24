import operation from "../../_operations/mcp/portals/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
