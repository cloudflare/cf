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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit apps update <account-app-id>\n\nUpdates an Account App"
		)
		.positional("account-app-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("hostnames", {
			type: "string",
			array: true,
			description: "FQDNs to associate with traffic decisions.",
		})
		.option("name", {
			type: "string",
			description: "Display name for the app.",
		})
		.option("type", { type: "string", description: "Category of the app." })
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

type Request = SdkRequest<"magic-account-apps-update-app">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <account-app-id>",
	describe: "Update an App",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit apps update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit apps update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/apps/${argv["account-app-id"] == null ? "<account-app-id>" : encodeURIComponent(String(argv["account-app-id"]))}`,
						pathParams: {
							"account-app-id": String(argv["account-app-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										hostnames: argv["hostnames"],
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
						client.magicTransit.apps.update({
							body: bodyData,
							account_id: accountId,
							account_app_id: argv["account-app-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					hostnames: argv["hostnames"],
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
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.apps.update({
						body: bodyData,
						account_id: accountId,
						account_app_id: argv["account-app-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
