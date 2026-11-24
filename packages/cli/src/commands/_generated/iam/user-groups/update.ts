import operation from "../../_operations/iam/user-groups/update.js";
/**
 * update command
 * @generated from apis/overlays/iam.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <user-group-id>",
	describe: "Update User Group",
	usage:
		"$0 iam user-groups update <user-group-id>\n\nModify an existing user group.",
	flags: {
		name: {
			kind: "parsed",
			brief: "Name of the User group.",
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'Policies attached to the User group. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string} & {"access": "allow" | "deny", "permission_groups": [{...}], "resource_groups": [{...}]})].',
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
	operands: [
		{
			placeholder: "user-group-id",
			brief: "User Group identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "iam user-groups update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam user-groups update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/iam/user_groups/${argv["user-group-id"] == null ? "<user-group-id>" : encodeURIComponent(String(argv["user-group-id"]))}`,
						pathParams: {
							"user-group-id": String(argv["user-group-id"] ?? ""),
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
										policies: parseObjectArray(argv["policies"], "policies"),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							user_group_id: argv["user-group-id"],
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
					policies: parseObjectArray(argv["policies"], "policies"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						user_group_id: argv["user-group-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
