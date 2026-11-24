import operation from "../../_operations/intel/sinkholes/create.js";
/**
 * create command
 * @generated from apis/overlays/intel.ts
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
	command: "create",
	describe: "Create a new sinkhole for your account",
	usage:
		"$0 intel sinkholes create\n\nCreate a new sinkhole. Logs of large request bodies will be truncated, but the full request body can be recorded in R2. If you wish to record large request bodies in R2, include the R2 key ID, key secret, and bucket name in the request body.",
	flags: {
		name: {
			kind: "parsed",
			brief: "The name of the sinkhole.",
			optional: true,
			parse: String,
		},
		"r2-bucket": {
			kind: "parsed",
			brief:
				"The name of the R2 bucket to store results. Required if you want to store large request bodies in R2.",
			optional: true,
			parse: String,
		},
		"r2-id": {
			kind: "parsed",
			brief:
				"The id of the R2 instance. Required if you want to store large request bodies in R2.",
			optional: true,
			parse: String,
		},
		"r2-secret": {
			kind: "parsed",
			brief:
				"The secret key for the R2 API token. Required if you want to store large request bodies in R2.",
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
				command: "intel sinkholes create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name of the sinkhole."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel sinkholes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/sinkholes`,
						pathParams: {},
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
										r2_bucket: resolveFileToken(
											argv["r2-bucket"] as string | undefined,
											"r2-bucket",
											"text"
										),
										r2_id: resolveFileToken(
											argv["r2-id"] as string | undefined,
											"r2-id",
											"text"
										),
										r2_secret: resolveFileToken(
											argv["r2-secret"] as string | undefined,
											"r2-secret",
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					r2_bucket: resolveFileToken(
						argv["r2-bucket"] as string | undefined,
						"r2-bucket",
						"text"
					),
					r2_id: resolveFileToken(
						argv["r2-id"] as string | undefined,
						"r2-id",
						"text"
					),
					r2_secret: resolveFileToken(
						argv["r2-secret"] as string | undefined,
						"r2-secret",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
