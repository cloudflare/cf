import operation from "../../../_operations/addressing/prefixes/delegations/create.js";
/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <prefix-id>",
	describe: "Create Prefix Delegation",
	usage:
		"$0 addressing prefixes delegations create <prefix-id>\n\nCreate a new account delegation for a given IP prefix.",
	flags: {
		cidr: {
			kind: "parsed",
			brief: "IP Prefix in Classless Inter-Domain Routing format.",
			optional: true,
			parse: String,
		},
		"delegated-account-id": {
			kind: "parsed",
			brief:
				"Account identifier for the account to which prefix is being delegated.",
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
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing prefixes delegations create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["cidr"] === undefined) {
						argv["cidr"] = await promptForRequiredField(
							"cidr",
							"IP Prefix in Classless Inter-Domain Routing format."
						);
					}
					if (argv["delegated-account-id"] === undefined) {
						argv["delegated-account-id"] = await promptForRequiredField(
							"delegated-account-id",
							"Account identifier for the account to which prefix is being delegated."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes delegations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes/${argv["prefix-id"] == null ? "<prefix-id>" : encodeURIComponent(String(argv["prefix-id"]))}/delegations`,
						pathParams: { "prefix-id": String(argv["prefix-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cidr: resolveFileToken(
											argv["cidr"] as string | undefined,
											"cidr",
											"text"
										),
										delegated_account_id: resolveFileToken(
											argv["delegated-account-id"] as string | undefined,
											"delegated-account-id",
											"text"
										),
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							prefix_id: argv["prefix-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					cidr: resolveFileToken(
						argv["cidr"] as string | undefined,
						"cidr",
						"text"
					),
					delegated_account_id: resolveFileToken(
						argv["delegated-account-id"] as string | undefined,
						"delegated-account-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						prefix_id: argv["prefix-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
