import operation from "../../_operations/accounts/members/update.js";
/**
 * update command
 * @generated from apis/overlays/accounts.ts
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
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <member-id>",
	describe: "Update Member",
	usage: "$0 accounts members update <member-id>\n\nModify an account member.",
	flags: {
		roles: {
			kind: "parsed",
			brief:
				'Roles assigned to this member. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'Array of policies associated with this member. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"access": "allow" | "deny", "permission_groups": [{...}], "resource_groups": [{...}]}].',
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
			placeholder: "member-id",
			brief: "Membership identifier tag.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("roles", ["policies"]);
		rules.conflicts("policies", ["roles"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts members update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts members update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/members/${argv["member-id"] == null ? "<member-id>" : encodeURIComponent(String(argv["member-id"]))}`,
						pathParams: { "member-id": String(argv["member-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										roles: parseObjectArray(argv["roles"], "roles"),
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
							member_id: argv["member-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					roles: parseObjectArray(argv["roles"], "roles"),
					policies: parseObjectArray(argv["policies"], "policies"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						member_id: argv["member-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
