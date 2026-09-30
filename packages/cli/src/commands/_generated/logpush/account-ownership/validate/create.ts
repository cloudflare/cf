import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
 * create command
 * @generated from apis/overlays/logpush.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logpush account-ownership validate create\n\nValidates ownership challenge of the destination."
		)
		.option("destination-conf", {
			type: "string",
			description:
				"Uniquely identifies a resource (such as an s3 bucket) where data. will be pushed. Additional configuration parameters supported by the destination may be included.",
		})
		.option("ownership-challenge", {
			type: "string",
			description: "Ownership challenge token to prove destination ownership.",
		})
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

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/logpush/ownership/validate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Validate ownership challenge",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush account-ownership validate create",
				classification: {
					safeFlags: ["dry-run", "show-secrets"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun(
						{
							command: "cf logpush account-ownership validate create",
							method: "POST",
							url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logpush/ownership/validate`,
							pathParams: {
								"account-or-zone": String(accountOrZone),
								"account-or-zone-id": String(accountOrZoneId),
							},
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											destination_conf: resolveFileToken(
												argv["destination-conf"] as string | undefined,
												"destination-conf",
												"text"
											),
											ownership_challenge: resolveFileToken(
												argv["ownership-challenge"] as string | undefined,
												"ownership-challenge",
												"text"
											),
										}),
						},
						{
							sensitiveBodyPaths: [
								["destination_conf"],
								["ownership_challenge"],
							],
							showSecrets: argv.showSecrets,
						}
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.logpush.accountOwnership.validate.create({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination-conf"] === undefined) {
					argv["destination-conf"] = await promptForRequiredField(
						"destination-conf",
						"Uniquely identifies a resource (such as an s3 bucket) where data. will be pushed. Additional configuration parameters supported by the destination may be included.",
						{ kind: "secret" }
					);
				}
				if (argv["ownership-challenge"] === undefined) {
					argv["ownership-challenge"] = await promptForRequiredField(
						"ownership-challenge",
						"Ownership challenge token to prove destination ownership.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destination_conf: resolveFileToken(
						argv["destination-conf"] as string | undefined,
						"destination-conf",
						"text"
					),
					ownership_challenge: resolveFileToken(
						argv["ownership-challenge"] as string | undefined,
						"ownership-challenge",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.logpush.accountOwnership.validate.create({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
