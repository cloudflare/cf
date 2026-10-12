import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb content export\n\nCreates a CSV export for content and accepts optional filters in the payload."
		)
		.option("dlp-profile-id", {
			type: "string",
			array: true,
			description: "Filter by DLP profile IDs.",
		})
		.option("dlp-profile-information", {
			type: "string",
			description:
				"DLP profile metadata for the export. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("integration-id", {
			type: "string",
			array: true,
			description: "Filter by integration IDs.",
		})
		.option("max-affliction-date", {
			type: "string",
			description: "Filter to view content flagged on or before this date.",
		})
		.option("min-affliction-date", {
			type: "string",
			description: "Filter to view content flagged on or after this date.",
		})
		.option("orders", {
			type: "string",
			description:
				"Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("search", {
			type: "string",
			description: "Search term to filter content.",
		})
		.option("vendors", {
			type: "string",
			array: true,
			description: "Filter by vendor types.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating content exports.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CreateContentExport">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "export",
	describe: "Create a content export",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb content export",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb content export",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/content/export`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dlp_profile_id: argv["dlp-profile-id"],
										dlp_profile_information: parseObjectArray(
											argv["dlp-profile-information"],
											"dlp-profile-information"
										),
										integration_id: argv["integration-id"],
										max_affliction_date: resolveFileToken(
											argv["max-affliction-date"] as string | undefined,
											"max-affliction-date",
											"text"
										),
										min_affliction_date: resolveFileToken(
											argv["min-affliction-date"] as string | undefined,
											"min-affliction-date",
											"text"
										),
										orders: parseObjectArray(argv["orders"], "orders"),
										search: resolveFileToken(
											argv["search"] as string | undefined,
											"search",
											"text"
										),
										vendors: argv["vendors"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.zeroTrust.casb.content.export({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				if (argv["dlp-profile-information"] === undefined) {
					throw new Error(
						"--dlp-profile-information is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					dlp_profile_id: argv["dlp-profile-id"],
					dlp_profile_information: parseObjectArray(
						argv["dlp-profile-information"],
						"dlp-profile-information"
					),
					integration_id: argv["integration-id"],
					max_affliction_date: resolveFileToken(
						argv["max-affliction-date"] as string | undefined,
						"max-affliction-date",
						"text"
					),
					min_affliction_date: resolveFileToken(
						argv["min-affliction-date"] as string | undefined,
						"min-affliction-date",
						"text"
					),
					orders: parseObjectArray(argv["orders"], "orders"),
					search: resolveFileToken(
						argv["search"] as string | undefined,
						"search",
						"text"
					),
					vendors: argv["vendors"],
				});
				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.casb.content.export({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
