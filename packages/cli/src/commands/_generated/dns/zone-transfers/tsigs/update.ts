import operation from "../../../_operations/dns/zone-transfers/tsigs/update.js";
/**
 * update command
 * @generated from apis/overlays/dns.ts
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
	command: "update <tsig-id>",
	describe: "Update TSIG",
	usage: "$0 dns zone-transfers tsigs update <tsig-id>\n\nModify TSIG.",
	flags: {
		algo: {
			kind: "parsed",
			brief: "TSIG algorithm.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "TSIG key name.",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "parsed",
			brief: "TSIG secret.",
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
	operands: [{ placeholder: "tsig-id", brief: "Tsig ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns zone-transfers tsigs update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["algo"] === undefined) {
						argv["algo"] = await promptForRequiredField(
							"algo",
							"TSIG algorithm."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"TSIG key name."
						);
					}
					if (argv["secret"] === undefined) {
						argv["secret"] = await promptForRequiredField(
							"secret",
							"TSIG secret.",
							{ kind: "secret" }
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns zone-transfers tsigs update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secondary_dns/tsigs/${argv["tsig-id"] == null ? "<tsig-id>" : encodeURIComponent(String(argv["tsig-id"]))}`,
						pathParams: { "tsig-id": String(argv["tsig-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										algo: resolveFileToken(
											argv["algo"] as string | undefined,
											"algo",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										secret: resolveFileToken(
											argv["secret"] as string | undefined,
											"secret",
											"text"
										),
									}),
						sensitiveBodyPaths: [["secret"]],
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
							tsig_id: argv["tsig-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					algo: resolveFileToken(
						argv["algo"] as string | undefined,
						"algo",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					secret: resolveFileToken(
						argv["secret"] as string | undefined,
						"secret",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tsig_id: argv["tsig-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
