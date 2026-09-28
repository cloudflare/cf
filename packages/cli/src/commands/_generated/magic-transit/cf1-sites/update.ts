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
			"$0 magic-transit cf1-sites update <cf1-site-id>\n\nPartially updates a specific CF1 Site for an account. Only the fields included in the request body are modified; omitted fields retain their existing values."
		)
		.positional("cf1-site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "A human-provided description of the CF1 Site.",
		})
		.option("location-lat", {
			type: "number",
			description: "Latitude of the CF1 Site.",
		})
		.option("location-long", {
			type: "number",
			description: "Longitude of the CF1 Site.",
		})
		.option("location-name", {
			type: "string",
			description: "Name of nearest town, city, or village.",
		})
		.option("name", {
			type: "string",
			description:
				"A human-provided name describing the CF1 Site that should be unique within the account.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Partial update payload for a CF1 Site. All properties are optional; only fields supplied in the request body are modified.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"magic-cf1-sites-update-cf1-site">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <cf1-site-id>",
	describe: "Update CF1 Site",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit cf1-sites update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit cf1-sites update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cf1_sites/${argv["cf1-site-id"] == null ? "<cf1-site-id>" : encodeURIComponent(String(argv["cf1-site-id"]))}`,
						pathParams: { "cf1-site-id": String(argv["cf1-site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										location: {
											lat: argv["location-lat"],
											long: argv["location-long"],
											name: resolveFileToken(
												argv["location-name"] as string | undefined,
												"location-name",
												"text"
											),
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.cf1Sites.update({
							...bodyData,
							account_id: accountId,
							cf1_site_id: argv["cf1-site-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					location: {
						lat: argv["location-lat"],
						long: argv["location-long"],
						name: resolveFileToken(
							argv["location-name"] as string | undefined,
							"location-name",
							"text"
						),
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.cf1Sites.update({
						...bodyData,
						account_id: accountId,
						cf1_site_id: argv["cf1-site-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
