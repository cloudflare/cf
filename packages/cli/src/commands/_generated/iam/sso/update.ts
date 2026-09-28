import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/iam.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 iam sso update <sso-connector-id>\n\nUpdates the state or configuration of an SSO connector."
		)
		.positional("sso-connector-id", {
			type: "string",
			description: "SSO Connector identifier tag.",
			demandOption: true,
		})
		.option("enabled", {
			type: "boolean",
			description: "SSO Connector enabled state",
		})
		.option("use-fedramp-language", {
			type: "boolean",
			description:
				"Controls the display of FedRAMP language to the user during SSO login",
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

type Request = SdkRequest<"update-sso-connector-state">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <sso-connector-id>",
	describe: "Update SSO connector state",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "iam sso update",
				classification: {
					safeFlags: ["enabled", "use-fedramp-language", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam sso update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/sso_connectors/${argv["sso-connector-id"] == null ? "<sso-connector-id>" : encodeURIComponent(String(argv["sso-connector-id"]))}`,
						pathParams: {
							"sso-connector-id": String(argv["sso-connector-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										enabled: argv["enabled"],
										use_fedramp_language: argv["use-fedramp-language"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.iam.sso.update({
							...bodyData,
							account_id: accountId,
							sso_connector_id: argv["sso-connector-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					enabled: argv["enabled"],
					use_fedramp_language: argv["use-fedramp-language"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.iam.sso.update({
						...bodyData,
						account_id: accountId,
						sso_connector_id: argv["sso-connector-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
