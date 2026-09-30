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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 dns zone-transfers tsigs update <tsig-id>\n\nModify TSIG.")
		.positional("tsig-id", {
			type: "string",
			description: "Tsig ID",
			demandOption: true,
		})
		.option("algo", { type: "string", description: "TSIG algorithm." })
		.option("name", { type: "string", description: "TSIG key name." })
		.option("secret", { type: "string", description: "TSIG secret." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("show-secrets", {
			type: "boolean",
			description: "Show sensitive values in dry-run output",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"secondary-dns-(-tsig)-update-tsig">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <tsig-id>",
	describe: "Update TSIG",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns zone-transfers tsigs update",
				classification: {
					safeFlags: ["dry-run", "show-secrets"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf dns zone-transfers tsigs update",
							method: "PUT",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secondary_dns/tsigs/${argv["tsig-id"] == null ? "<tsig-id>" : encodeURIComponent(String(argv["tsig-id"]))}`,
							pathParams: { "tsig-id": String(argv["tsig-id"] ?? "") },
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											algo: resolveFileToken(
												argv["algo"] as string | undefined,
												"algo",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											secret: resolveFileToken(
												argv["secret"] as string | undefined,
												"secret",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["secret"]], showSecrets: argv.showSecrets }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.dns.zoneTransfers.tsigs.update({
							body: bodyData,
							account_id: accountId,
							tsig_id: argv["tsig-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["algo"] === undefined) {
					argv["algo"] = await promptForRequiredField(
						"algo",
						"TSIG algorithm."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "TSIG key name.");
				}
				if (argv["secret"] === undefined) {
					argv["secret"] = await promptForRequiredField(
						"secret",
						"TSIG secret.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					algo: resolveFileToken(
						argv["algo"] as string | undefined,
						"algo",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					secret: resolveFileToken(
						argv["secret"] as string | undefined,
						"secret",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.dns.zoneTransfers.tsigs.update({
						body: bodyData,
						account_id: accountId,
						tsig_id: argv["tsig-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
