import operation from "../../../../_operations/zero-trust/dlp/validators/worker/create.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseScalarValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a worker validator",
	usage:
		"$0 zero-trust dlp validators worker create\n\nRegisters a customer Worker as a validator. An account may own at most 100 validators across all kinds.",
	flags: {
		default: {
			kind: "parsed",
			brief:
				"The default field. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A name for this validator, at most 50 characters.",
			optional: true,
			parse: String,
		},
		"script-tag": {
			kind: "parsed",
			brief:
				"The public script tag of the customer's Worker that scores matches.",
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
			brief: "Attributes of the new validator.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp validators worker create",
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
							"A name for this validator, at most 50 characters."
						);
					}
					if (argv["script-tag"] === undefined) {
						argv["script-tag"] = await promptForRequiredField(
							"script-tag",
							"The public script tag of the customer's Worker that scores matches."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp validators worker create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/validators/worker`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default: parseScalarValue(argv["default"], "default"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										script_tag: resolveFileToken(
											argv["script-tag"] as string | undefined,
											"script-tag",
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
					default: parseScalarValue(argv["default"], "default"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					script_tag: resolveFileToken(
						argv["script-tag"] as string | undefined,
						"script-tag",
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
