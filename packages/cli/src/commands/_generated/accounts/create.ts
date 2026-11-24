/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, requestApi } from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create an Account",
	usage:
		"$0 accounts create\n\nCreate an Account. To create the Account within an Organization, provide `unit.id` and omit `standalone`. To create a standalone Free Account, provide `standalone: true` and omit `unit`. Providing both fields is invalid. If you omit both fields, Cloudflare can determine the destination only when the User is an administrator of exactly one Organization. Cloudflare creates the Account in that Organization; otherwise, the request returns an error. Account names are limited to 65 UTF-8 bytes.",
	flags: {
		"idempotency-key": {
			kind: "parsed",
			brief:
				"Optional key that identifies an Account-creation request. Free Account creation can require exactly one valid key, so API clients should send a key with every Account-creation request. Reuse the same key when retrying the same request.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Account name, limited to 65 UTF-8 bytes.",
			optional: true,
			parse: String,
		},
		standalone: {
			kind: "boolean",
			brief:
				"Set to `true` and omit `unit` to create a standalone Free Account. If provided, this field must be `true`.",
			optional: true,
		},
		type: {
			kind: "parsed",
			brief:
				"the type of account being created. For self-serve customers, use standard. for enterprise customers, use enterprise.",
			default: "standard",
			choices: ["standard", "enterprise"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"unit-id": {
			kind: "parsed",
			brief: "Tenant unit ID",
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
			brief: "Parameters for account creation",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts create",
				classification: {
					safeFlags: ["standalone", "type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["idempotency-key"] !== undefined)
					headers["Idempotency-Key"] = String(argv["idempotency-key"]);
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Account name, limited to 65 UTF-8 bytes."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf accounts create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										standalone: argv["standalone"],
										type: argv["type"],
										unit: {
											id: resolveFileToken(
												argv["unit-id"] as string | undefined,
												"unit-id",
												"text"
											),
										},
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(client, "POST", `/accounts`, {
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["standalone"] !== undefined)
					setNestedValue(bodyData, ["standalone"], argv["standalone"]);
				if (argv["type"] !== undefined)
					setNestedValue(bodyData, ["type"], argv["type"]);
				if (argv["unit-id"] !== undefined)
					setNestedValue(
						bodyData,
						["unit", "id"],
						resolveFileToken(
							argv["unit-id"] as string | undefined,
							"unit-id",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(client, "POST", `/accounts`, {
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
