import { describe, it } from "vitest";

// cf dev delegates to a project implementation. These tests exercise
// Wrangler's internal startDevWorker / ConfigController / type-generation
// pipelines rather than that subprocess contract. Preserved as named .todo stubs so the inventory is
// available once cf dev lands.
describe("dev", () => {
	describe("config file support", () => {
		it.todo("should support wrangler.toml");
		it.todo("should support wrangler.json");
		it.todo("should support wrangler.jsonc");
	});

	describe("authorization without env var", () => {
		it.todo(
			"should kick you to the login flow when running wrangler dev in remote mode without authorization"
		);
	});

	describe("authorization with env var", () => {
		it.todo("should use config.account_id over env var");
		it.todo("should use env var when config.account_id is not set");
	});

	describe("compatibility-date", () => {
		it.todo(
			"should not warn if there is no wrangler.toml and no compatibility-date specified"
		);
		it.todo(
			"should warn if there is a wrangler.toml but no compatibility-date"
		);
		it.todo(
			"should not warn if there is a wrangler.toml but compatibility-date is specified at the command line"
		);
	});

	describe("entry-points", () => {
		it.todo("should error if there is no entry-point specified");
		it.todo("should use `main` from the top-level environment");
		it.todo("should use `main` from a named environment");
		it.todo(
			"should use `main` from a named environment, rather than the top-level"
		);
	});

	describe("routes", () => {
		it.todo("should pass routes to emitConfigUpdate");
		it.todo(
			"should error if custom domains with paths are passed in but allow paths on normal routes"
		);
		it.todo("should warn on mounted paths in dev");
	});

	describe("host", () => {
		it.todo("should resolve a host to its zone");
		it.todo("should read wrangler.toml's dev.host");
		it.todo("should read --route");
		it.todo("should read wrangler.toml's routes");
		it.todo("should read wrangler.toml's environment specific routes");
		it.todo("should strip leading `*` from given host when deducing a zone id");
		it.todo(
			"should strip leading `*.` from given host when deducing a zone id"
		);
		it.todo("should, when provided, use a configured zone_id");
		it.todo("should, when provided, use a zone_name to get a zone_id");
		it.todo("should find the host from the given pattern, not zone_name");
		it.todo("should fail for non-existing zones, when falling back from */*");
		it.todo("should fallback to zone_name when given the pattern */*");
		it.todo("fails when given the pattern */* and no zone_name");
		it.todo(
			"given a long host, it should use the longest subdomain that resolves to a zone"
		);

		describe("should, in order, use args.host/config.dev.host/args.routes/(config.route|config.routes)", () => {
			it.todo("config.routes");
			it.todo("config.route");
			it.todo("--routes");
			it.todo("config.dev.host");
			it.todo("host");
		});

		it.todo("should error if a host can't resolve to a zone");
		it.todo("should not try to resolve a zone when starting in local mode");
	});

	describe("local upstream", () => {
		it.todo("should use dev.host from toml by default");
		it.todo("should use route from toml by default");
		it.todo("should respect the option when provided");
	});

	describe("custom builds", () => {
		it.todo("should run a custom build before starting `dev`");
		it.todo(
			"should run a custom build of multiple steps combined by && before starting `dev`"
		);
		it.todo(
			"should throw an error if the entry doesn't exist after the build finishes"
		);
		describe(".env", () => {
			it.todo("should pass environment variables from `.env` to custom builds");
			it.todo(
				"should prefer to load environment variables from `.env.<environment>` if `--env <environment>` is set"
			);
			it.todo(
				"should use default `.env` if `.env.<environment>` does not exist"
			);
			it.todo(
				"should not override environment variables already on process.env"
			);
			it.todo(
				"should prefer to load environment variables from a custom path `.env` if `--env-file` is set"
			);
			it.todo(
				"should prefer to load environment variables from a custom path `.env` if multiple `--env-file` is set"
			);
			it.todo("should show reasonable debug output if `.env` does not exist");
		});
	});

	describe("upstream-protocol", () => {
		it.todo("should default upstream-protocol to `https` if remote mode");
		it.todo("should warn if `--upstream-protocol=http` is used in remote mode");
		it.todo("should default upstream-protocol to local-protocol if local mode");
		it.todo(
			"should default upstream-protocol to http if no local-protocol in local mode"
		);
	});

	describe("local-protocol", () => {
		it.todo("should default local-protocol to `http`");
		it.todo("should use `local_protocol` from `wrangler.toml`, if available");
		it.todo("should use --local-protocol command line arg, if provided");
	});

	describe("ip", () => {
		it.todo("should default ip to localhost");
		it.todo("should use to `ip` from `wrangler.toml`, if available");
		it.todo("should use --ip command line arg, if provided");
	});

	describe("inspector port", () => {
		it.todo("should use 9229 as the default port");
		it.todo("should read --inspector-port");
		it.todo("should read dev.inspector_port from wrangler.toml");
		it.todo("should error if a bad dev.inspector_port config is provided");
	});

	describe("inspector ip", () => {
		it.todo("should default inspector ip to 127.0.0.1");
		it.todo("should read --inspector-ip");
		it.todo("should read dev.inspector_ip from wrangler config");
		it.todo(
			"should use --inspector-ip over dev.inspector_ip from wrangler config"
		);
		it.todo("should error if a bad dev.inspector_ip config is provided");
	});

	describe("port", () => {
		it.todo("should default port to 8787 if it is not in use");
		it.todo("should use `port` from `wrangler.toml`, if available");
		it.todo("should error if a bad dev.port config is provided");
		it.todo("should use --port command line arg, if provided");
		it.todo("should use a different port to the default if it is in use");
	});

	describe("container engine", () => {
		it.todo("should default to socket of current docker context");
		it.todo("should be able to be set by config");
		it.todo("should be able to be set by env var");
	});

	describe("durable_objects", () => {
		it.todo(
			"should warn if there are remote Durable Objects, or a missing lifecycle for local Durable Objects"
		);
	});

	describe("variable display", () => {
		it.todo(
			"should render config vars literally, --var as hidden, and .dev.vars as hidden"
		);
	});

	describe(".dev.vars", () => {
		it.todo(
			"should override `vars` bindings from `wrangler.toml` with values in `.dev.vars`"
		);
		it.todo(
			"should prefer `.dev.vars.<environment>` if `--env <environment> set`"
		);
	});

	describe("secrets config", () => {
		it.todo("should load declared secrets from .dev.vars");
		it.todo("should load declared secrets from .env when no .dev.vars exists");
		it.todo(
			"should load declared secrets from process.env when not in .dev.vars or .env"
		);
		it.todo("should prefer .dev.vars over .env for declared secrets");
		it.todo("should warn when a required secret is missing");
		it.todo("should only include declared secrets from .dev.vars");
		it.todo("should not treat --var values as secrets");
		it.todo("should exclude .dev.vars keys when `secrets` is defined");
		it.todo(
			"should still read .dev.vars when secrets is not defined (backward compat)"
		);
	});

	describe(".env in local dev", () => {
		it.todo("should get local dev `vars` from `.env`");
		it.todo(
			"should not load local dev `vars` from `.env` if there is a `.dev.vars` file"
		);
		it.todo(
			"should not load local dev `vars` from `.env` if CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV is set to false"
		);
		it.todo(
			"should get local dev `vars` from appropriate `.env.<environment>` files when --env=<environment> is set"
		);
		it.todo(
			"should get local dev vars from appropriate `.env` files when --env=<environment> is set but no .env.<environment> file exists"
		);
		it.todo(
			"should get local dev `vars` from `process.env` when `CLOUDFLARE_INCLUDE_PROCESS_ENV` is true"
		);
		it.todo(
			"should get local dev `vars` from appropriate `.env.<environment>` files when --env-file is set"
		);
		it.todo(
			"should get local dev `vars` from appropriate `.env.<environment>` files when multiple --env-file options are set"
		);
	});

	describe("serve static assets", () => {
		it.todo("should error if --site is used with no value");
		describe("should indicate whether Sites is being used", () => {
			it.todo("no use");
			it.todo("--site arg");
		});
	});

	describe("--assets", () => {
		it.todo("should not require entry point if using --assets");
		it.todo("should error if config.site and config.assets are used together");
		it.todo("should error if config.site and --assets are used together");
		it.todo(
			"should error if an ASSET binding is provided without a user Worker"
		);
		it.todo("should warn if run_worker_first=true but no binding is provided");
		it.todo(
			"should error if run_worker_first is true and no user Worker is provided"
		);
		it.todo(
			"should error if directory specified by '--assets' command line argument does not exist"
		);
		it.todo(
			"should error if directory specified by '[assets]' configuration key does not exist"
		);
		it.todo(
			"should error with a clear error message if the path specified by '--assets' command line argument is a file, not a directory"
		);
		it.todo(
			"should error with a clear error message if the path specified by '[assets]' configuration key is a file, not a directory"
		);
	});

	describe("service bindings", () => {
		it.todo("should warn when using service bindings");
		it.todo("should show self-bindings as connected");
	});

	describe("print bindings", () => {
		it.todo("should print bindings");
		it.todo("should mask vars that were overriden in .dev.vars");
	});

	describe("`browser run binding", () => {
		it.todo("should not show error when running locally");
	});

	it.todo("should error helpfully if pages_build_output_dir is set");

	describe("containers", () => {
		it.todo("should warn when run in remote mode with (enabled) containers");
		it.todo("should not warn when run in remote mode with disabled containers");
	});

	describe("generate types", () => {
		it.todo("should default `generate_types` to `false`");
		it.todo(
			"should set `generate_types` to `true` when `--types` flag is passed"
		);
		it.todo(
			"should set `generate_types` to `true` when `--types=true` is passed"
		);
		it.todo(
			"should set `generate_types` to `false` when `--types=false` is passed"
		);
		it.todo("should read `dev.generate_types` from wrangler config file");
		it.todo(
			"should allow `--types` flag to override `dev.generate_types` from config"
		);
		it.todo(
			"should allow `--types=false` to override `dev.generate_types` from config"
		);

		describe("type file regeneration", () => {
			it.todo("should warn about out of date types when `--types` is not set");
			it.todo(
				"should warn about out of date types when `dev.generate_types` is `false` in config"
			);
			it.todo(
				"should regenerate types when `--types` flag is set and types are out of date"
			);
			it.todo(
				"should regenerate types when `dev.generate_types` is `true` in config and types are out of date"
			);
			it.todo("should not warn about types if the types file does not exist");
			it.todo("should not regenerate types when types file is up to date");
		});
	});

	describe("multi-worker mode", () => {
		it.todo("should pass --env to auxiliary workers");
	});
});
