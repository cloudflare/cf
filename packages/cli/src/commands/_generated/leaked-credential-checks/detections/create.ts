import operation from "../../_operations/leaked-credential-checks/detections/create.js";
/**
 * create command
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a custom detection location for a zone.",
	usage:
		'$0 leaked-credential-checks detections create\n\nCreate a detection location for credentials that the default scan locations do not cover, using Rules language expressions such as `lookup_json_string(http.request.body.raw, "user")`. Only the username expression is required, and Leaked Credential Checks must be enabled on the zone.',
	flags: {
		password: {
			kind: "parsed",
			brief:
				"Defines ehe ruleset expression to use in matching the password in a request.",
			optional: true,
			parse: String,
		},
		username: {
			kind: "parsed",
			brief:
				"Defines the ruleset expression to use in matching the username in a request.",
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
			brief:
				"Defines a custom set of username/password expressions to match Leaked Credential Checks on.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "leaked-credential-checks detections create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf leaked-credential-checks detections create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/leaked-credential-checks/detections`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										password: resolveFileToken(
											argv["password"] as string | undefined,
											"password",
											"text"
										),
										username: resolveFileToken(
											argv["username"] as string | undefined,
											"username",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					password: resolveFileToken(
						argv["password"] as string | undefined,
						"password",
						"text"
					),
					username: resolveFileToken(
						argv["username"] as string | undefined,
						"username",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
