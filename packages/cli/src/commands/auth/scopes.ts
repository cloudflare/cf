import { readAuthCredentials } from "../../lib/oauth/index.js";
import { hint, info, theme, warning } from "../../lib/ui/index.js";
import { formatScopeGroups, formatScopeSummary } from "./scope-groups.js";
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
				description: "Show the permissions of the products matching this name",
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

	handler: (argv: ArgumentsCamelCase<ScopesArgs>): void => {
		if (process.env.CLOUDFLARE_API_TOKEN) {
			console.log(
				warning(
					"CLOUDFLARE_API_TOKEN is set, so its own permissions apply rather than OAuth scopes."
				)
			);
			return;
		}

		const scopes = readAuthCredentials()?.scopes;
		if (!scopes) {
			console.log(
				info(`Not logged in. Run ${theme.code("cf auth login")} to log in.`)
			);
			return;
		}

		if (argv.product === undefined && !argv.all && argv.filter === undefined) {
			console.log(formatScopeSummary(scopes));
			console.log(
				hint(
					`Run ${theme.code("cf auth scopes <product>")} to see a product's permissions, or ${theme.code("cf auth scopes --all")} for every product.`
				)
			);
			return;
		}

		console.log(
			formatScopeGroups(scopes, {
				product: argv.product,
				filter: argv.filter,
			}) || theme.muted("No granted scopes match.")
		);
	},
};

export default scopesCommand;
