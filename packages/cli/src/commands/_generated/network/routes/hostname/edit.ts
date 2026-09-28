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
 * edit command
 * @generated from apis/overlays/network.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network routes hostname edit <hostname-route-id>\n\nUpdates a hostname route."
		)
		.positional("hostname-route-id", {
			type: "string",
			description: "The hostname route ID.",
			demandOption: true,
		})
		.option("comment", {
			type: "string",
			description: "An optional description of the hostname route.",
		})
		.option("hostname", {
			type: "string",
			description: "The hostname of the route.",
		})
		.option("tunnel-id", { type: "string", description: "UUID of the tunnel." })
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

type Request = SdkRequest<"zero-trust-networks-route-hostname-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <hostname-route-id>",
	describe: "Update hostname route",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network routes hostname edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes hostname edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/routes/hostname/${argv["hostname-route-id"] == null ? "<hostname-route-id>" : encodeURIComponent(String(argv["hostname-route-id"]))}`,
						pathParams: {
							"hostname-route-id": String(argv["hostname-route-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										tunnel_id: resolveFileToken(
											argv["tunnel-id"] as string | undefined,
											"tunnel-id",
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
						client.network.routes.hostname.edit({
							...bodyData,
							account_id: accountId,
							hostname_route_id: argv["hostname-route-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					tunnel_id: resolveFileToken(
						argv["tunnel-id"] as string | undefined,
						"tunnel-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.network.routes.hostname.edit({
						...bodyData,
						account_id: accountId,
						hostname_route_id: argv["hostname-route-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
