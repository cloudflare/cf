import operation from "../_operations/basin-catalog/enable.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * enable command
 * @generated from apis/overlays/basin-catalog.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 basin-catalog enable <bucket-name>\n\nEnable an R2 bucket as an Apache Iceberg catalog. This operation creates the necessary catalog infrastructure and activates the bucket for storing Iceberg metadata and data files."
		)
		.positional("bucket-name", {
			type: "string",
			description: "Specifies the R2 bucket name to enable as catalog.",
			demandOption: true,
		})
		.option("credential-token", {
			type: "string",
			description: "Provides the Cloudflare API token for accessing R2.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Contains the optional request to enable a catalog. Send an empty body to keep the defaults. If you include \`credential\`, the service checks that the token can access the bucket, then stores it as the catalog's maintenance credential, like the store credentials operation. ",
		})
		.check((argv) => {
			const groupSet = ["credential-token"].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["credential-token"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --credential-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "enable <bucket-name>",
	describe: "Enable R2 bucket as a catalog",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog enable",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog enable",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/enable`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										credential: {
											token: resolveFileToken(
												argv["credential-token"] as string | undefined,
												"credential-token",
												"text"
											),
										},
									}),
						sensitiveBodyPaths: [["credential", "token"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							bucket_name: argv["bucket-name"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					credential: {
						token: resolveFileToken(
							argv["credential-token"] as string | undefined,
							"credential-token",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						bucket_name: argv["bucket-name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
