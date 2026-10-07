import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * failover command
 * @generated from apis/overlays/mesh.ts
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
import { confirmDelete, promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mesh nodes failover <node-id>\n\nTriggers a manual failover for a specific Mesh node, setting the specified client as the active connector. The tunnel must be configured for high availability (HA) and the client must be linked to the tunnel."
		)
		.positional("node-id", {
			type: "string",
			description: "UUID of the tunnel.",
			demandOption: true,
		})
		.option("connector-id", {
			type: "string",
			description: "UUID of the Cloudflare Tunnel connector.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"cloudflare-tunnel-manual-failover-warp-connector-tunnel">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "failover <node-id>",
	describe: "Trigger a manual failover for a Mesh node",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mesh nodes failover",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes failover",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector/${argv["node-id"] == null ? "<node-id>" : encodeURIComponent(String(argv["node-id"]))}/failover`,
						pathParams: { "node-id": String(argv["node-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										client_id: resolveFileToken(
											argv["connector-id"] as string | undefined,
											"connector-id",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation triggers a manual failover, changing the active connector for a Mesh node.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.mesh.nodes.failover({
							...bodyData,
							account_id: accountId,
							"node-id": argv["node-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["connector-id"] === undefined) {
					argv["connector-id"] = await promptForRequiredField(
						"connector-id",
						"UUID of the Cloudflare Tunnel connector."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					client_id: resolveFileToken(
						argv["connector-id"] as string | undefined,
						"connector-id",
						"text"
					),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.mesh.nodes.failover({
						...bodyData,
						account_id: accountId,
						"node-id": argv["node-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
