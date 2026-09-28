import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 tenant-custom-nameservers create <tenant-tag>\n\nAdds a custom nameserver for a tenant."
		)
		.positional("tenant-tag", {
			type: "string",
			description: "Tenant identifier tag.",
			demandOption: true,
		})
		.option("ns-name", {
			type: "string",
			description: "The FQDN of the name server.",
		})
		.option("ns-set", {
			type: "number",
			description: "The number of the set that this name server belongs to.",
			default: 1,
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
	SdkRequest<"tenant-level-custom-nameservers-add-tenant-custom-nameserver">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <tenant-tag>",
	describe: "Add Tenant Custom Nameserver",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant-custom-nameservers create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf tenant-custom-nameservers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-tag"] == null ? "<tenant-tag>" : encodeURIComponent(String(argv["tenant-tag"]))}/custom_ns`,
						pathParams: { "tenant-tag": String(argv["tenant-tag"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ns_name: resolveFileToken(
											argv["ns-name"] as string | undefined,
											"ns-name",
											"text"
										),
										ns_set: argv["ns-set"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.tenantCustomNameservers.create({
							body: bodyData,
							tenant_tag: argv["tenant-tag"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["ns-name"] === undefined) {
					argv["ns-name"] = await promptForRequiredField(
						"ns-name",
						"The FQDN of the name server."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ns_name: resolveFileToken(
						argv["ns-name"] as string | undefined,
						"ns-name",
						"text"
					),
					ns_set: argv["ns-set"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.tenantCustomNameservers.create({
						body: bodyData,
						tenant_tag: argv["tenant-tag"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
