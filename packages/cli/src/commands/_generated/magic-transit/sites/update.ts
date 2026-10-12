import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
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
		.usage("$0 magic-transit sites update <site-id>\n\nUpdate a specific Site.")
		.positional("site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("connector-id", {
			type: "string",
			description: "Magic Connector identifier tag.",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("ha-mode", {
			type: "boolean",
			description:
				"Site high availability mode. If set to true, the site can have two connectors and runs in high availability mode.",
		})
		.option("location-lat", { type: "string", description: "Latitude" })
		.option("location-lon", { type: "string", description: "Longitude" })
		.option("name", { type: "string", description: "The name of the site." })
		.option("secondary-connector-id", {
			type: "string",
			description:
				"Magic Connector identifier tag. Used when high availability mode is on.",
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

type Request = SdkRequest<"magic-sites-update-site">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <site-id>",
	describe: "Update Site",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites update",
				classification: {
					safeFlags: ["ha-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}`,
						pathParams: { "site-id": String(argv["site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										connector_id: resolveFileToken(
											argv["connector-id"] as string | undefined,
											"connector-id",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										ha_mode: argv["ha-mode"],
										location: {
											lat: resolveFileToken(
												argv["location-lat"] as string | undefined,
												"location-lat",
												"text"
											),
											lon: resolveFileToken(
												argv["location-lon"] as string | undefined,
												"location-lon",
												"text"
											),
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										secondary_connector_id: resolveFileToken(
											argv["secondary-connector-id"] as string | undefined,
											"secondary-connector-id",
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
						client.magicTransit.sites.update({
							body: bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					connector_id: resolveFileToken(
						argv["connector-id"] as string | undefined,
						"connector-id",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					ha_mode: argv["ha-mode"],
					location: {
						lat: resolveFileToken(
							argv["location-lat"] as string | undefined,
							"location-lat",
							"text"
						),
						lon: resolveFileToken(
							argv["location-lon"] as string | undefined,
							"location-lon",
							"text"
						),
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					secondary_connector_id: resolveFileToken(
						argv["secondary-connector-id"] as string | undefined,
						"secondary-connector-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.sites.update({
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
