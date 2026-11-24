import operation from "../../_operations/organizations/invites/update.js";
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <member-code>",
	describe: "Handle organization invite",
	usage:
		"$0 organizations invites update <member-code>\n\nAccept or reject an invitation to a specific organization. The credential must belong to the invited user. No additional API token permission is required.",
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "The ID of the organization associated with the invitation.",
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "The status field",
			optional: true,
			choices: ["accept", "reject"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"The invitation action. Use `accept` to join the organization or `reject` to decline the invitation.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "member-code",
			brief: "The invitation code to accept or reject.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations invites update",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["status"] === undefined) {
						argv["status"] = await promptForRequiredEnumField(
							"status",
							"The status field",
							["accept", "reject"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf organizations invites update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/invites/${argv["member-code"] == null ? "<member-code>" : encodeURIComponent(String(argv["member-code"]))}`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
							"member-code": String(argv["member-code"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										status: argv["status"],
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
							member_code: argv["member-code"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					status: argv["status"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						organization_id: argv["organization-id"],
						member_code: argv["member-code"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
