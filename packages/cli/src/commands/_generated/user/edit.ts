import operation from "../_operations/user/edit.js";
/**
 * edit command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Edit User",
	usage: "$0 user edit\n\nEdit part of your user details.",
	flags: {
		country: {
			kind: "parsed",
			brief: "The country in which the user lives.",
			optional: true,
			parse: String,
		},
		"first-name": {
			kind: "parsed",
			brief: "User's first name",
			optional: true,
			parse: String,
		},
		"last-name": {
			kind: "parsed",
			brief: "User's last name",
			optional: true,
			parse: String,
		},
		telephone: {
			kind: "parsed",
			brief: "User's telephone number",
			optional: true,
			parse: String,
		},
		zipcode: {
			kind: "parsed",
			brief: "The zipcode or postal code where the user lives.",
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
				command: "user edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/user`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
										),
										first_name: resolveFileToken(
											argv["first-name"] as string | undefined,
											"first-name",
											"text"
										),
										last_name: resolveFileToken(
											argv["last-name"] as string | undefined,
											"last-name",
											"text"
										),
										telephone: resolveFileToken(
											argv["telephone"] as string | undefined,
											"telephone",
											"text"
										),
										zipcode: resolveFileToken(
											argv["zipcode"] as string | undefined,
											"zipcode",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					),
					first_name: resolveFileToken(
						argv["first-name"] as string | undefined,
						"first-name",
						"text"
					),
					last_name: resolveFileToken(
						argv["last-name"] as string | undefined,
						"last-name",
						"text"
					),
					telephone: resolveFileToken(
						argv["telephone"] as string | undefined,
						"telephone",
						"text"
					),
					zipcode: resolveFileToken(
						argv["zipcode"] as string | undefined,
						"zipcode",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
