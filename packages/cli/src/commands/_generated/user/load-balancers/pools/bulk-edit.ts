import operation from "../../../_operations/user/load-balancers/pools/bulk-edit.js";
/**
 * bulk-edit command
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
	command: "bulk-edit",
	describe: "Patch Pools",
	usage:
		"$0 user load-balancers pools bulk-edit\n\nApply changes to a number of existing pools, overwriting the supplied properties. Pools are ordered by ascending `name`. Returns the list of affected pools. Supports the standard pagination query parameters, either `limit`/`offset` or `per_page`/`page`.",
	flags: {
		"notification-email": {
			kind: "parsed",
			brief:
				'The email address to send health status notifications to. This field is now deprecated in favor of Cloudflare Notifications for Load Balancing, so only resetting this field with an empty string `""` is accepted.',
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
				command: "user load-balancers pools bulk-edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers pools bulk-edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										notification_email: resolveFileToken(
											argv["notification-email"] as string | undefined,
											"notification-email",
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
					notification_email: resolveFileToken(
						argv["notification-email"] as string | undefined,
						"notification-email",
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
