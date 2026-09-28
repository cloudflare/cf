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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access custom-pages update <custom-page-id>\n\nUpdate a custom page"
		)
		.positional("custom-page-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("app-count", {
			type: "number",
			description: "Number of apps the custom page is assigned to.",
		})
		.option("contract-version", {
			type: "number",
			description:
				"Contract version of the page's Liquid template. Present (>= 1) marks a sanitized template; absent or 0 marks a legacy page served verbatim.",
		})
		.option("custom-html", { type: "string", description: "Custom page HTML." })
		.option("name", { type: "string", description: "Custom page name." })
		.option("type", {
			type: "string",
			description: "Custom page type.",
			choices: ["identity_denied", "forbidden", "login", "interstitial"],
		})
		.option("uid", { type: "string", description: "UUID." })
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

type Request = SdkRequest<"access-custom-pages-update-a-custom-page">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <custom-page-id>",
	describe: "Update a custom page",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access custom-pages update",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access custom-pages update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/custom_pages/${argv["custom-page-id"] == null ? "<custom-page-id>" : encodeURIComponent(String(argv["custom-page-id"]))}`,
						pathParams: {
							"custom-page-id": String(argv["custom-page-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										app_count: argv["app-count"],
										contract_version: argv["contract-version"],
										custom_html: resolveFileToken(
											argv["custom-html"] as string | undefined,
											"custom-html",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
										uid: resolveFileToken(
											argv["uid"] as string | undefined,
											"uid",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.access.customPages.update({
							body: bodyData,
							account_id: accountId,
							custom_page_id: argv["custom-page-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["custom-html"] === undefined) {
					argv["custom-html"] = await promptForRequiredField(
						"custom-html",
						"Custom page HTML."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Custom page name."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Custom page type.",
						["identity_denied", "forbidden", "login", "interstitial"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					app_count: argv["app-count"],
					contract_version: argv["contract-version"],
					custom_html: resolveFileToken(
						argv["custom-html"] as string | undefined,
						"custom-html",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
					uid: resolveFileToken(
						argv["uid"] as string | undefined,
						"uid",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.access.customPages.update({
						body: bodyData,
						account_id: accountId,
						custom_page_id: argv["custom-page-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
