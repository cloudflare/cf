import { getAuthFromEnv } from "@cloudflare/workers-auth";
import {
	getActiveProfile,
	readAuthCredentials,
} from "../../lib/oauth/index.js";
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
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { ScopeCatalogue } from "./scope-catalogue.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

// `cf auth login` only re-authenticates the default profile.
function reloginCommand(force: boolean): string {
	const profile = getActiveProfile();
	if (profile !== "default") {
		return `cf auth create ${profile}`;
	}
	return force ? "cf auth login --force" : "cf auth login";
}

// The schema-help wording points at CLOUDFLARE_API_TOKEN, which this command
// never uses.
function describeCatalogueFailure(err: unknown): string {
	const status = (err as { statusCode?: number } | null)?.statusCode;
	if (status === 401 || status === 403) {
		return `your login was rejected; run ${theme.code(reloginCommand(true))} to log in again`;
	}
	return describeSchemaFailure(err);
}

interface ScopesArgs extends Pick<
	CommonYargsOptions,
	"temporary-account" | "event-code"
> {
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
					"Show the granted permissions in product areas matching this name, such as dns or developer",
			})
			.option("all", {
				type: "boolean",
				description: "Show every granted permission, grouped by product",
				default: false,
			})
			.option("filter", {
				type: "string",
				description:
					"Show the granted permissions whose scope contains this term",
			}) as Argv<ScopesArgs>;
	},

	handler: async (argv: ArgumentsCamelCase<ScopesArgs>): Promise<void> => {
		if (argv["temporary-account"] || argv["event-code"] !== undefined) {
			throw new Error(
				"--temporary-account and --event-code are not supported by cf auth scopes."
			);
		}

		if (getAuthFromEnv({ allowGlobalAuthKey: false }) !== undefined) {
			log.warn(
				`${theme.code("CLOUDFLARE_API_TOKEN")} is set, so its own permissions apply rather than OAuth scopes.`
			);
			return;
		}

		const credentials = readAuthCredentials();
		if (credentials?.oauth_token === undefined) {
			log.info(
				`Not logged in. Run ${theme.code(reloginCommand(false))} to log in.`
			);
			return;
		}

		const { scopes } = credentials;
		if (!scopes) {
			log.info(
				`This login didn't record its scopes. Run ${theme.code(reloginCommand(true))} to log in again.`
			);
			return;
		}

		if (!hasProductScopes(scopes)) {
			log.info(
				`No product scopes granted. Run ${theme.code(reloginCommand(true))} to log in with the default scopes.`
			);
			return;
		}

		let catalogue: ScopeCatalogue;
		try {
			catalogue = await loadScopeCatalogue(async () => {
				const { createCommandClient } = await import("../../lib/auth.js");
				return createCommandClient(argv);
			});
		} catch (err) {
			log.warn(
				`Couldn't load Cloudflare's scope catalogue (${describeCatalogueFailure(err)}), so scopes are listed without product groups.`
			);
			console.log(scopes.join("\n"));
			return;
		}

		if (argv.product === undefined && !argv.all && argv.filter === undefined) {
			console.log(formatScopeSummary(scopes, catalogue));
			log.info(
				`Run ${theme.code("cf auth scopes <product>")} to see a product's permissions, or ${theme.code("cf auth scopes --all")} for every granted product.`
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
