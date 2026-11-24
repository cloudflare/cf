import operation from "../../_operations/r2/temporary-credentials/create.js";
/**
 * create command
 * @generated from apis/overlays/r2.ts
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
	describe: "Create Temporary Access Credentials",
	usage:
		"$0 r2 temporary-credentials create\n\nCreates temporary access credentials on a bucket that can be optionally scoped to prefixes or objects. The credentials grant either a permission level or an explicit list of S3 actions.",
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'S3 actions allowed on the credentials; requests for any other action are denied. For example, `["GetObject", "HeadObject"]` allows reading objects without listing them. Exactly one of `permission` or `actions` must be provided. The parent token must have Object Read & Write permission if any action writes, and Object Read otherwise.',
			variadic: true,
			optional: true,
			parse: String,
		},
		bucket: {
			kind: "parsed",
			brief: "Name of the R2 bucket.",
			optional: true,
			parse: String,
		},
		objects: {
			kind: "parsed",
			brief: "Optional object paths to scope the credentials to.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"parent-access-key-id": {
			kind: "parsed",
			brief:
				"Access key ID of the parent R2 API token. The temporary credentials cannot exceed this token's permissions.",
			optional: true,
			parse: String,
		},
		permission: {
			kind: "parsed",
			brief:
				"Permissions allowed on the credentials. Exactly one of `permission` or `actions` must be provided.",
			optional: true,
			choices: [
				"admin-read-write",
				"admin-read-only",
				"object-read-write",
				"object-read-only",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "permission", "text"),
		},
		prefixes: {
			kind: "parsed",
			brief: "Optional prefix paths to scope the credentials to.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ttl-seconds": {
			kind: "parsed",
			brief:
				"Lifetime of the temporary credentials in seconds, up to 604800 seconds (7 days).",
			default: "900",
			parse: Number,
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
				command: "r2 temporary-credentials create",
				classification: {
					safeFlags: ["permission", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["bucket"] === undefined) {
						argv["bucket"] = await promptForRequiredField(
							"bucket",
							"Name of the R2 bucket."
						);
					}
					if (argv["parent-access-key-id"] === undefined) {
						argv["parent-access-key-id"] = await promptForRequiredField(
							"parent-access-key-id",
							"Access key ID of the parent R2 API token. The temporary credentials cannot exceed this token's permissions."
						);
					}
					if (argv["ttl-seconds"] === undefined) {
						throw new Error(
							"--ttl-seconds is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 temporary-credentials create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/temp-access-credentials`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actions: argv["actions"],
										bucket: resolveFileToken(
											argv["bucket"] as string | undefined,
											"bucket",
											"text"
										),
										objects: argv["objects"],
										parentAccessKeyId: resolveFileToken(
											argv["parent-access-key-id"] as string | undefined,
											"parent-access-key-id",
											"text"
										),
										permission: argv["permission"],
										prefixes: argv["prefixes"],
										ttlSeconds: argv["ttl-seconds"],
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
					actions: argv["actions"],
					bucket: resolveFileToken(
						argv["bucket"] as string | undefined,
						"bucket",
						"text"
					),
					objects: argv["objects"],
					parentAccessKeyId: resolveFileToken(
						argv["parent-access-key-id"] as string | undefined,
						"parent-access-key-id",
						"text"
					),
					permission: argv["permission"],
					prefixes: argv["prefixes"],
					ttlSeconds: argv["ttl-seconds"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
