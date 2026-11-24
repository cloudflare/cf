import operation from "../../_operations/user/tokens/create.js";
/**
 * create command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Token",
	usage: "$0 user tokens create\n\nCreate a new access token.",
	flags: {
		"condition-request-ip-in": {
			kind: "parsed",
			brief: "List of IPv4/IPv6 CIDR addresses.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"condition-request-ip-not-in": {
			kind: "parsed",
			brief: "List of IPv4/IPv6 CIDR addresses.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"expires-on": {
			kind: "parsed",
			brief:
				"The expiration time on or after which the JWT MUST NOT be accepted for processing.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Token name.",
			optional: true,
			parse: String,
		},
		"not-before": {
			kind: "parsed",
			brief:
				"The time before which the token MUST NOT be accepted for processing.",
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'List of access policies assigned to the token. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"effect": "allow" | "deny", "permission_groups": [{...}], "resources": {...}}].',
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
				command: "user tokens create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField("name", "Token name.");
					}
					if (argv["policies"] === undefined) {
						throw new Error(
							"--policies is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf user tokens create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/user/tokens`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										condition: {
											request_ip: {
												in: argv["condition-request-ip-in"],
												not_in: argv["condition-request-ip-not-in"],
											},
										},
										expires_on: resolveFileToken(
											argv["expires-on"] as string | undefined,
											"expires-on",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										not_before: resolveFileToken(
											argv["not-before"] as string | undefined,
											"not-before",
											"text"
										),
										policies: parseObjectArray(argv["policies"], "policies"),
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
						client.send(operation, { body: bodyData })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					condition: {
						request_ip: {
							in: argv["condition-request-ip-in"],
							not_in: argv["condition-request-ip-not-in"],
						},
					},
					expires_on: resolveFileToken(
						argv["expires-on"] as string | undefined,
						"expires-on",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					not_before: resolveFileToken(
						argv["not-before"] as string | undefined,
						"not-before",
						"text"
					),
					policies: parseObjectArray(argv["policies"], "policies"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
