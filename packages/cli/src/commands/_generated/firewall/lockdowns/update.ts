import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/firewall.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 firewall lockdowns update <lock-downs-id>\n\nUpdates an existing Zone Lockdown rule."
		)
		.positional("lock-downs-id", {
			type: "string",
			description: "The unique identifier of the Zone Lockdown rule.",
			demandOption: true,
		})
		.option("configurations", {
			type: "string",
			description:
				"A list of IP addresses or CIDR ranges that will be allowed to access the URLs specified in the Zone Lockdown rule. You can include any number of `ip` or `ip_range` configurations. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("urls", {
			type: "string",
			array: true,
			description:
				"The URLs to include in the current WAF override. You can use wildcards. Each entered URL will be escaped before use, which means you can only use simple wildcard patterns.",
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

type Request = SdkRequest<"zone-lockdown-update-a-zone-lockdown-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <lock-downs-id>",
	describe: "Update a Zone Lockdown rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall lockdowns update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall lockdowns update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/lockdowns/${argv["lock-downs-id"] == null ? "<lock-downs-id>" : encodeURIComponent(String(argv["lock-downs-id"]))}`,
						pathParams: {
							"lock-downs-id": String(argv["lock-downs-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configurations: parseObjectArray(
											argv["configurations"],
											"configurations"
										),
										urls: argv["urls"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.firewall.lockdowns.update({
							...bodyData,
							zone_id: zoneId,
							lock_downs_id: argv["lock-downs-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["configurations"] === undefined) {
					throw new Error(
						"--configurations is required (or pass --body with this field set)."
					);
				}
				if (argv["urls"] === undefined) {
					throw new Error(
						"--urls is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					configurations: parseObjectArray(
						argv["configurations"],
						"configurations"
					),
					urls: argv["urls"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.firewall.lockdowns.update({
						...bodyData,
						zone_id: zoneId,
						lock_downs_id: argv["lock-downs-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
