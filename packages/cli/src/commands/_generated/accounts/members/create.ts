import operation from "../../_operations/accounts/members/create.js";
/**
 * create command
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
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Add Member",
	usage:
		"$0 accounts members create\n\nAdd a user to the list of members for this account.",
	flags: {
		email: {
			kind: "parsed",
			brief: "The contact email address of the user.",
			optional: true,
			parse: String,
		},
		roles: {
			kind: "parsed",
			brief: "Array of roles associated with this member.",
			variadic: true,
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Status of the member invitation. If not provided during creation, defaults to 'pending'.\nChanging from 'accepted' back to 'pending' will trigger a replacement of the member resource in Terraform.",
			optional: true,
			choices: ["accepted", "pending"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
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
	operands: [],
	rules(rules) {
		rules.conflicts("roles", ["policies"]);
		rules.conflicts("policies", ["roles"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts members create",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["email"] === undefined) {
						argv["email"] = await promptForRequiredField(
							"email",
							"The contact email address of the user."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts members create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/members`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										email: resolveFileToken(
											argv["email"] as string | undefined,
											"email",
											"text"
										),
										roles: argv["roles"],
										status: argv["status"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					email: resolveFileToken(
						argv["email"] as string | undefined,
						"email",
						"text"
					),
					roles: argv["roles"],
					status: argv["status"],
					policies: parseObjectArray(argv["policies"], "policies"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
