import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 buckets create\n\nCreates an R2 bucket in the account and selected jurisdiction, with an optional location hint and default storage class."
		)
		.option("cf-r2-jurisdiction", {
			type: "string",
			description:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
		})
		.option("location-hint", {
			type: "string",
			description: "Location of the bucket.",
			choices: ["apac", "eeur", "enam", "weur", "wnam", "oc"],
		})
		.coerce("location-hint", (value) =>
			resolveFileToken(value, "location-hint", "text")
		)
		.option("name", { type: "string", description: "Name of the bucket." })
		.option("storage-class", {
			type: "string",
			description:
				"Storage class for newly uploaded objects, unless specified otherwise.",
			choices: ["Standard", "InfrequentAccess"],
			default: "Standard",
		})
		.coerce("storage-class", (value) =>
			resolveFileToken(value, "storage-class", "text")
		)
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Bucket",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets create",
				classification: {
					safeFlags: ["location-hint", "storage-class", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										locationHint: argv["location-hint"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										storageClass: argv["storage-class"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/r2/buckets`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the bucket."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["location-hint"] !== undefined)
					setNestedValue(bodyData, ["locationHint"], argv["location-hint"]);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["storage-class"] !== undefined)
					setNestedValue(bodyData, ["storageClass"], argv["storage-class"]);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/r2/buckets`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
