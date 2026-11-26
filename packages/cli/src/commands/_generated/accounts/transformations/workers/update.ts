import operation from "../../../_operations/accounts/transformations/workers/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts transformations workers update <script-name>\n\nSets the `/cdn-cgi/image/` URL transformations setting for requests served by a Worker. This overrides the zone-level Image Transformations and Allowed Origins settings for requests handled by the Worker."
		)
		.positional("script-name", {
			type: "string",
			description: "Name of the Worker script.",
			demandOption: true,
		})
		.option("allowed-origins", {
			type: "string",
			array: true,
			description:
				'Origins that source images may be fetched from, without a protocol, e.g. `images.example.com`,\n`*.example.com` or `images.example.com/uploads/`. When set, only these origins are allowed, so\ninclude the Worker\'s own hostname if it serves the images. Omit to allow only images from the\nzone of the request. Use `["*"]` to allow any origin. Ignored when `enabled` is `false`.\n',
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Whether URL transformations are enabled for the Worker. Set to `false` to disable them,\noverriding the zone-level setting.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Controls \`/cdn-cgi/image/\` URL transformations for requests served by a Worker.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <script-name>",
	describe: "Set Image Transformations setting for a Worker",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts transformations workers update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts transformations workers update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/settings/transformations/workers/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}`,
						pathParams: { "script-name": String(argv["script-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allowed_origins: argv["allowed-origins"],
										enabled: argv["enabled"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							script_name: argv["script-name"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					allowed_origins: argv["allowed-origins"],
					enabled: argv["enabled"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						script_name: argv["script-name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
