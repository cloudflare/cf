import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization list\n\nRetrieve a list of organizations a particular user has access to. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.option("id", {
			type: "string",
			description:
				"Only return organizations with the specified IDs (ex. id=foo&id=bar). Send multiple elements\nby repeating the query value.",
		})
		.option("name", {
			type: "string",
			description:
				"(case-sensitive) Filter the list of organizations to where the name is equal to a\nparticular string.",
		})
		.option("name-starts-with", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of organizations to where the name starts with a\nparticular string.",
		})
		.option("name-ends-with", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of organizations to where the name ends with a particular\nstring.",
		})
		.option("name-contains", {
			type: "string",
			description:
				"(case-insensitive) Filter the list of organizations to where the name contains a particular\nstring.",
		})
		.option("containing-account", {
			type: "string",
			description:
				"Filter the list of organizations to the ones that contain this particular\naccount.",
		})
		.option("containing-user", {
			type: "string",
			description:
				'Filter the list of organizations to the ones that contain this particular\nuser.\n\nIMPORTANT: Just because an organization "contains" a user is not a\nrepresentation of any authorization or privilege to manage any resources\ntherein. An organization "containing" a user simply means the user is managed by\nthat organization.',
		})
		.option("containing-organization", {
			type: "string",
			description:
				"Filter the list of organizations to the ones that contain this particular\norganization.",
		})
		.option("parent-id", {
			type: "string",
			description:
				'Filter the list of organizations to the ones that are a sub-organization\nof the specified organization.\n\n"null" is a valid value to provide for this parameter. It means "where\nan organization has no parent (i.e. it is a \'root\' organization)."',
		})
		.option("page-token", {
			type: "string",
			description:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
		})
		.option("page-size", {
			type: "number",
			description: "The amount of items to return. Defaults to 10.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Query = SdkQuery<"Organization_listOrganizations">;

const typedBuilder = withArgTypes<
	{
		"parent-id": Query["parent.id"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List organizations the user has access to",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					id: argv["id"],
					name: argv["name"],
					"name.startsWith": argv["name-starts-with"],
					"name.endsWith": argv["name-ends-with"],
					"name.contains": argv["name-contains"],
					"containing.account": argv["containing-account"],
					"containing.user": argv["containing-user"],
					"containing.organization": argv["containing-organization"],
					"parent.id": argv["parent-id"],
					page_token: argv["page-token"],
					page_size: argv["page-size"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.organization.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
