import operation from "../_operations/organizations/update.js";
/**
 * update command
 * @generated from apis/overlays/organizations.ts
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
	command: "update <organization-id>",
	describe: "Update organization",
	usage:
		"$0 organizations update <organization-id>\n\nUpdate an organization's name. Supplying `parent_id` verifies the current parent; this endpoint cannot move an organization. Organization names are limited to 65 UTF-8 bytes.",
	flags: {
		name: {
			kind: "parsed",
			brief:
				"The Organization name, limited to 65 UTF-8 bytes. An omitted, empty, or unchanged value is a no-op.",
			optional: true,
			parse: String,
		},
		"parent-id": {
			kind: "parsed",
			brief:
				"The current parent Organization ID. A different value is rejected; this endpoint cannot move an Organization.",
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
			brief: "The Organization fields to update or verify.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "organization-id",
			brief: "The ID of the organization to modify.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
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
										parent_id: resolveFileToken(
											argv["parent-id"] as string | undefined,
											"parent-id",
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
						client.send(operation, {
							body: bodyData,
							organization_id: argv["organization-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					parent_id: resolveFileToken(
						argv["parent-id"] as string | undefined,
						"parent-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						organization_id: argv["organization-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
