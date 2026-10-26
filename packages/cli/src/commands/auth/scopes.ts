import { createCommandClient } from "../../lib/auth.js";
import { readAuthCredentials } from "../../lib/oauth/index.js";
import { describeSchemaFailure } from "../../lib/schema-cache.js";
import { theme } from "../../lib/ui/index.js";
import { log } from "../../lib/ui/log.js";
import { loadScopeCatalogue } from "./scope-catalogue.js";
import {
	areaTitles,
	formatScopeGroups,
	formatScopeSummary,
	hasProductScopes,
	matchesArea,
} from "./scope-groups.js";
import type { ScopeCatalogue } from "./scope-catalogue.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface ScopesArgs {
	product?: string;
	all?: boolean;
	filter?: string;
}

const scopesCommand: CommandModule<object, ScopesArgs> = {
	command: "scopes [product]",
	describe: "Show the OAuth scopes granted to the current login, by product",

	builder: (yargs: Argv): Argv<ScopesArgs> => {
		return yargs
			.positional("product", {
				type: "string",
				description:
					"Show the permissions in the product areas matching this name, such as dns or developer",
			})
			.option("all", {
				type: "boolean",
				description: "Show the permissions of every product",
				default: false,
			})
			.option("filter", {
				type: "string",
				description: "Show only the permissions whose scope contains this term",
			}) as Argv<ScopesArgs>;
	},

	handler: async (argv: ArgumentsCamelCase<ScopesArgs>): Promise<void> => {
		if (process.env.CLOUDFLARE_API_TOKEN) {
			log.warn(
				`${theme.code("CLOUDFLARE_API_TOKEN")} is set, so its own permissions apply rather than OAuth scopes.`
			);
			return;
		}

		const scopes = readAuthCredentials()?.scopes;
		if (!scopes) {
			log.info(`Not logged in. Run ${theme.code("cf auth login")} to log in.`);
			return;
		}

		if (!hasProductScopes(scopes)) {
			log.info(
				`No product scopes granted. Run ${theme.code("cf auth login --force")} to log in with the default scopes.`
			);
			return;
		}

		let catalogue: ScopeCatalogue;
		try {
			catalogue = await loadScopeCatalogue(() => createCommandClient(argv));
		} catch (err) {
			log.warn(
				`Couldn't load Cloudflare's scope catalogue (${describeSchemaFailure(err)}), so scopes are listed without product groups.`
			);
			console.log(scopes.join("\n"));
			return;
		}

		if (argv.product === undefined && !argv.all && argv.filter === undefined) {
			console.log(formatScopeSummary(scopes, catalogue));
			log.info(
				`Run ${theme.code("cf auth scopes <product>")} to see a product's permissions, or ${theme.code("cf auth scopes --all")} for every product.`
			);
			return;
		}

		const { product } = argv;
		if (
			product !== undefined &&
			!areaTitles(catalogue).some((area) => matchesArea(area, product))
		) {
			log.info(
				`No product area matches "${product}". Run ${theme.code(`cf auth scopes --filter ${product}`)} to search scope names instead.`
			);
			return;
		}

		console.log(
			formatScopeGroups(scopes, catalogue, {
				product: argv.product,
				filter: argv.filter,
			}) || theme.muted("No granted scopes match.")
		);
	},
};

export default scopesCommand;
