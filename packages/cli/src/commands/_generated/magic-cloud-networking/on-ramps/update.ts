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
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-cloud-networking on-ramps update <onramp-id>\n\nUpdate an On-ramp (Closed Beta)."
		)
		.positional("onramp-id", {
			type: "string",
			description: "Onramp ID",
			demandOption: true,
		})
		.option("attached-hubs", {
			type: "string",
			array: true,
			description: "The attached_hubs field",
		})
		.option("attached-vpcs", {
			type: "string",
			array: true,
			description: "The attached_vpcs field",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("install-routes-in-cloud", {
			type: "boolean",
			description: "The install_routes_in_cloud field",
		})
		.option("install-routes-in-magic-wan", {
			type: "boolean",
			description: "The install_routes_in_magic_wan field",
		})
		.option("manage-hub-to-hub-attachments", {
			type: "boolean",
			description: "The manage_hub_to_hub_attachments field",
		})
		.option("manage-vpc-to-hub-attachments", {
			type: "boolean",
			description: "The manage_vpc_to_hub_attachments field",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("vpc", { type: "string", description: "The vpc field" })
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

type Request = SdkRequest<"onramps-update">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <onramp-id>",
	describe: "Update On-ramp",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking on-ramps update",
				classification: {
					safeFlags: [
						"install-routes-in-cloud",
						"install-routes-in-magic-wan",
						"manage-hub-to-hub-attachments",
						"manage-vpc-to-hub-attachments",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking on-ramps update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/onramps/${argv["onramp-id"] == null ? "<onramp-id>" : encodeURIComponent(String(argv["onramp-id"]))}`,
						pathParams: { "onramp-id": String(argv["onramp-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										attached_hubs: argv["attached-hubs"],
										attached_vpcs: argv["attached-vpcs"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										install_routes_in_cloud: argv["install-routes-in-cloud"],
										install_routes_in_magic_wan:
											argv["install-routes-in-magic-wan"],
										manage_hub_to_hub_attachments:
											argv["manage-hub-to-hub-attachments"],
										manage_vpc_to_hub_attachments:
											argv["manage-vpc-to-hub-attachments"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										vpc: resolveFileToken(
											argv["vpc"] as string | undefined,
											"vpc",
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
						client.magicCloudNetworking.onRamps.update({
							body: bodyData,
							account_id: accountId,
							onramp_id: argv["onramp-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					attached_hubs: argv["attached-hubs"],
					attached_vpcs: argv["attached-vpcs"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					install_routes_in_cloud: argv["install-routes-in-cloud"],
					install_routes_in_magic_wan: argv["install-routes-in-magic-wan"],
					manage_hub_to_hub_attachments: argv["manage-hub-to-hub-attachments"],
					manage_vpc_to_hub_attachments: argv["manage-vpc-to-hub-attachments"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					vpc: resolveFileToken(
						argv["vpc"] as string | undefined,
						"vpc",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicCloudNetworking.onRamps.update({
						body: bodyData,
						account_id: accountId,
						onramp_id: argv["onramp-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
