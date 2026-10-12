import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws tenant-structures nodes update <node-id>\n\nUpdates the node's display name or parent while preserving its immutable identity fields."
		)
		.positional("node-id", {
			type: "string",
			description: "ID of the node to update",
			demandOption: true,
		})
		.option("structure-id", {
			type: "string",
			description: "ID of the parent tenant structure",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description:
				"Display name (e.g. an OU or account name), mutable. Optional; empty by default.",
		})
		.option("native-id", {
			type: "string",
			description:
				"Cloud-native identifier of this node, unique within the structure; the parent-reference target. Shape depends on the structure's application. Immutable after create.",
		})
		.option("node-kind", {
			type: "string",
			description:
				"Position in the tree. Legal values depend on the structure's application (aws: root/ou/account; cloudflare: org/account/zone). At most one root per structure. Immutable after create.",
		})
		.option("parent", {
			type: "string",
			description:
				"Native ID of this node's parent. Required for non-root nodes and omitted for the root. The parent must be in the same structure and able to contain this node kind.",
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

type Request = SdkRequest<"cws-update-tenant-node">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <node-id>",
	describe: "Update a tenant node",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws tenant-structures nodes update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws tenant-structures nodes update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/tenant-structures/${argv["structure-id"] == null ? "<structure-id>" : encodeURIComponent(String(argv["structure-id"]))}/nodes/${argv["node-id"] == null ? "<node-id>" : encodeURIComponent(String(argv["node-id"]))}`,
						pathParams: {
							"structure-id": String(argv["structure-id"] ?? ""),
							"node-id": String(argv["node-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										native_id: resolveFileToken(
											argv["native-id"] as string | undefined,
											"native-id",
											"text"
										),
										node_kind: resolveFileToken(
											argv["node-kind"] as string | undefined,
											"node-kind",
											"text"
										),
										parent: resolveFileToken(
											argv["parent"] as string | undefined,
											"parent",
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
						client.zeroTrust.cws.tenantStructures.nodes.update({
							body: bodyData,
							account_id: accountId,
							structure_id: argv["structure-id"],
							node_id: argv["node-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["native-id"] === undefined) {
					argv["native-id"] = await promptForRequiredField(
						"native-id",
						"Cloud-native identifier of this node, unique within the structure; the parent-reference target. Shape depends on the structure's application. Immutable after create."
					);
				}
				if (argv["node-kind"] === undefined) {
					argv["node-kind"] = await promptForRequiredField(
						"node-kind",
						"Position in the tree. Legal values depend on the structure's application (aws: root/ou/account; cloudflare: org/account/zone). At most one root per structure. Immutable after create."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					native_id: resolveFileToken(
						argv["native-id"] as string | undefined,
						"native-id",
						"text"
					),
					node_kind: resolveFileToken(
						argv["node-kind"] as string | undefined,
						"node-kind",
						"text"
					),
					parent: resolveFileToken(
						argv["parent"] as string | undefined,
						"parent",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.cws.tenantStructures.nodes.update({
						body: bodyData,
						account_id: accountId,
						structure_id: argv["structure-id"],
						node_id: argv["node-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
