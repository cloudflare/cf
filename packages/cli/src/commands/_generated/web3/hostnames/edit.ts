import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/web3.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 web3 hostnames edit <identifier>\n\nEdit Web3 Hostname")
		.positional("identifier", {
			type: "string",
			description: "Specify the identifier of the hostname.",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "Specify an optional description of the hostname.",
		})
		.option("dnslink", {
			type: "string",
			description: "Specify the DNSLink value used if the target is ipfs.",
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

type Request = SdkRequest<"web3-hostname-edit-web3-hostname">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <identifier>",
	describe: "Edit Web3 Hostname",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web3 hostnames edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web3 hostnames edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}`,
						pathParams: {
							identifier: String(argv["identifier"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
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
										dnslink: resolveFileToken(
											argv["dnslink"] as string | undefined,
											"dnslink",
											"text"
										),
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
						client.web3.hostnames.edit({
							...bodyData,
							zone_id: zoneId,
							identifier: argv["identifier"],
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
					dnslink: resolveFileToken(
						argv["dnslink"] as string | undefined,
						"dnslink",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.web3.hostnames.edit({
						...bodyData,
						zone_id: zoneId,
						identifier: argv["identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
