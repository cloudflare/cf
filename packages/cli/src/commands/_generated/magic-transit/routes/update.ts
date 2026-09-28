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
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit routes update <route-id>\n\nUpdate a specific Magic static route. Use `?validate_only=true` as an optional query parameter to run validation only without persisting changes."
		)
		.positional("route-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description:
				"An optional human provided description of the static route.",
		})
		.option("nexthop", {
			type: "string",
			description: "The next-hop IP Address for the static route.",
		})
		.option("prefix", {
			type: "string",
			description: "IP Prefix in Classless Inter-Domain Routing format.",
		})
		.option("priority", {
			type: "number",
			description: "Priority of the static route.",
		})
		.option("scope-colo-names", {
			type: "string",
			array: true,
			description: "List of colo names for the ECMP scope.",
		})
		.option("scope-colo-regions", {
			type: "string",
			array: true,
			description: "List of colo regions for the ECMP scope.",
		})
		.option("weight", {
			type: "number",
			description: "Optional weight of the ECMP scope - if provided.",
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

type Request = SdkRequest<"magic-static-routes-update-route">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <route-id>",
	describe: "Update Route",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit routes update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit routes update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/routes/${argv["route-id"] == null ? "<route-id>" : encodeURIComponent(String(argv["route-id"]))}`,
						pathParams: { "route-id": String(argv["route-id"] ?? "") },
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
										nexthop: resolveFileToken(
											argv["nexthop"] as string | undefined,
											"nexthop",
											"text"
										),
										prefix: resolveFileToken(
											argv["prefix"] as string | undefined,
											"prefix",
											"text"
										),
										priority: argv["priority"],
										scope: {
											colo_names: argv["scope-colo-names"],
											colo_regions: argv["scope-colo-regions"],
										},
										weight: argv["weight"],
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
						client.magicTransit.routes.update({
							body: bodyData,
							account_id: accountId,
							route_id: argv["route-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["nexthop"] === undefined) {
					argv["nexthop"] = await promptForRequiredField(
						"nexthop",
						"The next-hop IP Address for the static route."
					);
				}
				if (argv["prefix"] === undefined) {
					argv["prefix"] = await promptForRequiredField(
						"prefix",
						"IP Prefix in Classless Inter-Domain Routing format."
					);
				}
				if (argv["priority"] === undefined) {
					throw new Error(
						"--priority is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					nexthop: resolveFileToken(
						argv["nexthop"] as string | undefined,
						"nexthop",
						"text"
					),
					prefix: resolveFileToken(
						argv["prefix"] as string | undefined,
						"prefix",
						"text"
					),
					priority: argv["priority"],
					scope: {
						colo_names: argv["scope-colo-names"],
						colo_regions: argv["scope-colo-regions"],
					},
					weight: argv["weight"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.routes.update({
						body: bodyData,
						account_id: accountId,
						route_id: argv["route-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
