import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access groups update <group-id>\n\nUpdates a configured Access group."
		)
		.positional("group-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("exclude", {
			type: "string",
			description:
				"Rules evaluated with a NOT logical operator. To match a policy, a user cannot meet any of the Exclude rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("include", {
			type: "string",
			description:
				"Rules evaluated with an OR logical operator. A user needs to meet only one of the Include rules. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("is-default", {
			type: "boolean",
			description: "Whether this is the default group",
		})
		.option("name", {
			type: "string",
			description: "The name of the Access group.",
		})
		.option("require", {
			type: "string",
			description:
				"Rules evaluated with an AND logical operator. To match a policy, a user must meet all of the Require rules. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request =
	SdkRequest<"generated:put:/{account_or_zone}/{account_or_zone_id}/access/groups/{group_id}">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <group-id>",
	describe: "Update an Access group",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access groups update",
				classification: {
					safeFlags: ["is-default", "dry-run"],
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
					formatDryRun({
						command: "cf zero-trust access groups update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/access/groups/${argv["group-id"] == null ? "<group-id>" : encodeURIComponent(String(argv["group-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"group-id": String(argv["group-id"] ?? ""),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										exclude: parseObjectArray(argv["exclude"], "exclude"),
										include: parseObjectArray(argv["include"], "include"),
										is_default: argv["is-default"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										require: parseObjectArray(argv["require"], "require"),
									}),
					});
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
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.access.groups.update({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							group_id: argv["group-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["include"] === undefined) {
					throw new Error(
						"--include is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the Access group."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					exclude: parseObjectArray(argv["exclude"], "exclude"),
					include: parseObjectArray(argv["include"], "include"),
					is_default: argv["is-default"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					require: parseObjectArray(argv["require"], "require"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.access.groups.update({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						group_id: argv["group-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
