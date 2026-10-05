import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 temporary-credentials create\n\nCreates temporary access credentials on a bucket that can be optionally scoped to prefixes or objects."
		)
		.option("bucket", { type: "string", description: "Name of the R2 bucket." })
		.option("objects", {
			type: "string",
			array: true,
			description: "Optional object paths to scope the credentials to.",
		})
		.option("parent-access-key-id", {
			type: "string",
			description:
				"Access key ID of the parent R2 API token. The temporary credentials cannot exceed this token's permissions.",
		})
		.option("permission", {
			type: "string",
			description: "Permissions allowed on the credentials.",
			choices: [
				"admin-read-write",
				"admin-read-only",
				"object-read-write",
				"object-read-only",
			],
		})
		.option("prefixes", {
			type: "string",
			array: true,
			description: "Optional prefix paths to scope the credentials to.",
		})
		.option("ttl-seconds", {
			type: "number",
			description:
				"Lifetime of the temporary credentials in seconds, up to 604800 seconds (7 days).",
			default: 900,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"r2-create-temp-access-credentials">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Temporary Access Credentials",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 temporary-credentials create",
				classification: {
					safeFlags: ["permission", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										permission: resolveFileToken(
											argv["permission"] as string | undefined,
											"permission",
											"text"
										),
										prefixes: argv["prefixes"],
										ttlSeconds: argv["ttl-seconds"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.r2.temporaryCredentials.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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
				if (argv["permission"] === undefined) {
					argv["permission"] = await promptForRequiredEnumField(
						"permission",
						"Permissions allowed on the credentials.",
						[
							"admin-read-write",
							"admin-read-only",
							"object-read-write",
							"object-read-only",
						] as const
					);
				}
				if (argv["ttl-seconds"] === undefined) {
					throw new Error(
						"--ttl-seconds is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					permission: resolveFileToken(
						argv["permission"] as string | undefined,
						"permission",
						"text"
					),
					prefixes: argv["prefixes"],
					ttlSeconds: argv["ttl-seconds"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.r2.temporaryCredentials.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
