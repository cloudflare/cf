import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// HyperdriveConfig + body types are defined locally — wrangler's
// `../hyperdrive/client` module doesn't exist in cf.
interface HyperdriveOrigin {
	scheme?: string;
	host?: string;
	port?: number;
	database?: string;
	user?: string;
	password?: string;
	access_client_id?: string;
	access_client_secret?: string;
	service_id?: string;
}
interface HyperdriveCaching {
	disabled?: boolean;
	max_age?: number;
	stale_while_revalidate?: number;
}
interface HyperdriveMtls {
	ca_certificate_id?: string;
	mtls_certificate_id?: string;
	sslmode?: string;
}
interface HyperdriveConfig {
	id: string;
	name: string;
	origin: HyperdriveOrigin;
	caching?: HyperdriveCaching;
	mtls?: HyperdriveMtls;
	origin_connection_limit?: number;
}
interface CreateUpdateHyperdriveBody {
	name?: string;
	origin?: HyperdriveOrigin;
	caching?: HyperdriveCaching;
	mtls?: HyperdriveMtls;
	origin_connection_limit?: number;
}
type PatchHyperdriveBody = CreateUpdateHyperdriveBody;

function runHyperdriveCreate(body: CreateUpdateHyperdriveBody) {
	return runWrangler(`hyperdrive create --body='${JSON.stringify(body)}'`);
}

// Wrangler's `hyperdrive help` describe block tested wrangler-only help text
// (banner, command list with positional `<name>`/`<id>`, GLOBAL FLAGS, etc).
// cf's hyperdrive surface is generated from forge — different commands
// (`create | delete | edit | get | list | update`), different help layout,
// no `--config`/`--cwd`/`--env-file`. The whole describe is wrangler-only.
describe.skip("hyperdrive help", () => {
	it.skip("should show help text when no arguments are passed", async () => {});
	it.skip("should show help when an invalid argument is pased", async () => {});
});

describe("hyperdrive commands", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();

	const std = mockConsoleMethods();

	beforeEach(() => {
		// @ts-expect-error we're using a very simple setTimeout mock here
		vi.spyOn(global, "setTimeout").mockImplementation((fn, _period) => {
			setImmediate(fn);
		});
		setIsTTY(true);
	});

	afterEach(() => {
		clearDialogs();
	});

	// All `--connection-string=...` create tests are wrangler-only — cf has
	// no equivalent flag. Caller-supplied origins use the generated raw `--body`
	// path rather than individual flags. Connection-string parsing
	// (URL decode of user/password/database, default-port substitution per
	// scheme) is a wrangler input transformation that has no analogue in cf.
	it.skip("should handle creating a hyperdrive config", async () => {});
	it.skip("should not include remote option in hyperdrive config output (hyperdrive does not support remote bindings)", async () => {});
	it.skip("should handle creating a hyperdrive and printing a TOML snipped", async () => {});
	it.skip("should handle creating a hyperdrive config for postgres without a port specified", async () => {});
	it.skip("should handle creating a hyperdrive config for mysql without a port specified", async () => {});
	it.skip("should handle creating a hyperdrive config with caching options", async () => {});
	it.skip("should handle creating a hyperdrive config if the user is URL encoded", async () => {});
	it.skip("should handle creating a hyperdrive config if the password is URL encoded", async () => {});
	it.skip("should handle creating a hyperdrive config if the database name is URL encoded", async () => {});

	// The current create schema exposes caller-supplied origins through raw
	// `--body`; only the managed-integration variant has individual flags.
	it("should create a hyperdrive config given individual params instead of a connection string without a scheme set", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 5432,
				scheme: "postgresql",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 5432,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should create a hyperdrive config given individual params instead of a connection string", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "postgresql",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should create a hyperdrive config given individual params instead of a connection string with mysql scheme", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "mysql",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "mysql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should handle creating a hyperdrive config with origin_connection_limit", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 12345,
				scheme: "postgresql",
			},
			origin_connection_limit: 50,
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 12345,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			  "origin_connection_limit": 50,
			}
		`);
	});

	// wrangler validated `--host=''` (empty string) with a custom error
	// "You must provide an origin hostname for the database". cf does no
	// equivalent post-yargs validation — empty string flows through to the
	// API. Wrangler-only.
	it.skip("should reject a create hyperdrive command if individual params are empty strings", async () => {});

	// The caller-supplied origin flags are no longer generated for create, so
	// their yargs-only validation cases are Wrangler-specific.
	it.skip("should reject a create hyperdrive command if an unexpected origin-scheme is provided", async () => {});

	// wrangler had a `--connection-string` flag mutex'd with `--origin-host`.
	// cf has no `--connection-string` flag at all, so the mutex test is
	// wrangler-only.
	it.skip("should reject a create hyperdrive command if both connection string and individual origin params are provided", async () => {});

	it("should create a hyperdrive over access config given the right params", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				scheme: "postgresql",
				access_client_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.access",
				access_client_secret:
					"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "access_client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.access",
			    "access_client_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should create a hyperdrive over access config with a path in the host", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com/database",
				database: "neondb",
				user: "test",
				password: "password",
				scheme: "postgresql",
				access_client_id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.access",
				access_client_secret:
					"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "access_client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.access",
			    "access_client_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
			    "database": "neondb",
			    "host": "example.com/database",
			    "password": "password",
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should create a hyperdrive config with a VPC service ID", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				service_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
				database: "neondb",
				user: "test",
				password: "password",
				scheme: "postgresql",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "password": "password",
			    "scheme": "postgresql",
			    "service_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			    "user": "test",
			  },
			}
		`);
	});

	it("should create a hyperdrive config with a VPC service ID and mysql scheme", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				service_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
				database: "mydb",
				user: "test",
				password: "password",
				scheme: "mysql",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "test123",
			  "origin": {
			    "database": "mydb",
			    "password": "password",
			    "scheme": "mysql",
			    "service_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			    "user": "test",
			  },
			}
		`);
	});

	it.skip("should reject a create hyperdrive config with --origin-service-id and --origin-host", async () => {});

	// cf has no --connection-string flag, so there's no analogous mutex with
	// --origin-service-id.
	it.skip("should reject a create hyperdrive config with --service-id and --connection-string", async () => {});

	it.skip("should reject a create hyperdrive config with --origin-service-id and --origin-access-client-id", async () => {});

	it.skip("should reject a create hyperdrive over access command if access client ID is set but not access client secret", async () => {});

	it.skip("should reject a create hyperdrive over access command if access client secret is set but not access client ID", async () => {});

	// wrangler accepted lowercase (`require`/`verify-ca`/`verify-full`) AND
	// uppercase MySQL-style (`REQUIRED`/`VERIFY_CA`/`VERIFY_IDENTITY`) sslmode
	// values. cf's --mtls-sslmode choices are only the lowercase set
	// (forge schema). The uppercase variants — and the `--ca-certificate-id`
	// / `--mtls-certificate-id` / `--sslmode` flag names without the
	// `mtls-` prefix — are wrangler-only.
	//
	it("should successfully create a hyperdrive with mtls config and sslmode=verify-full", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "postgresql",
			},
			mtls: {
				ca_certificate_id: "12345",
				mtls_certificate_id: "1234",
				sslmode: "verify-full",
			},
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "ca_certificate_id": "12345",
			    "mtls_certificate_id": "1234",
			    "sslmode": "verify-full",
			  },
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should successfully create a hyperdrive with mtls config and sslmode=require", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "postgresql",
			},
			mtls: { mtls_certificate_id: "1234", sslmode: "require" },
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "mtls_certificate_id": "1234",
			    "sslmode": "require",
			  },
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should allow create hyperdrive with mtls config sslmode=require and CA flag set", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "postgresql",
			},
			mtls: { ca_certificate_id: "1234", sslmode: "require" },
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "ca_certificate_id": "1234",
			    "sslmode": "require",
			  },
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should allow create hyperdrive with mtls config sslmode=verify-ca missing CA", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "postgresql",
			},
			mtls: { mtls_certificate_id: "1234", sslmode: "verify-ca" },
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "mtls_certificate_id": "1234",
			    "sslmode": "verify-ca",
			  },
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it("should allow create hyperdrive with mtls config sslmode=verify-full missing CA", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveCreate();
		await runHyperdriveCreate({
			name: "test123",
			origin: {
				host: "example.com",
				database: "neondb",
				user: "test",
				password: "password",
				port: 1234,
				scheme: "postgresql",
			},
			mtls: { mtls_certificate_id: "1234", sslmode: "verify-full" },
		});
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "mtls_certificate_id": "1234",
			    "sslmode": "verify-full",
			  },
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "password": "password",
			    "port": 1234,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			}
		`);
	});

	it.skip("should error on create hyperdrive with invalid sslmode", async () => {});

	// MySQL-style sslmode values (REQUIRED / VERIFY_CA / VERIFY_IDENTITY)
	// aren't in cf's `--mtls-sslmode` choices (forge schema only allows
	// `require`/`verify-ca`/`verify-full`). Wrangler-only.
	it.skip("should successfully create a MySQL hyperdrive with mtls config and sslmode=VERIFY_IDENTITY", async () => {});
	it.skip("should successfully create a MySQL hyperdrive with mtls config and sslmode=VERIFY_CA", async () => {});
	it.skip("should successfully create a MySQL hyperdrive with sslmode=REQUIRED", async () => {});
	it.skip("should accept MySQL sslmode in lowercase", async () => {});
	it.skip("should allow create MySQL hyperdrive with sslmode=REQUIRED and CA flag set", async () => {});
	it.skip("should allow create MySQL hyperdrive with sslmode=VERIFY_CA missing CA", async () => {});
	it.skip("should allow create MySQL hyperdrive with sslmode=VERIFY_IDENTITY missing CA", async () => {});
	it.skip("should allow create MySQL hyperdrive with PostgreSQL sslmode value", async () => {});

	it("should handle listing configs", async ({ expect }) => {
		mockHyperdriveGetListOrDelete();
		await runWrangler("hyperdrive list");
		// cf's `list` outputs raw JSON — wrangler rendered an ASCII table.
		expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
			[
			  {
			    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			    "name": "test123",
			    "origin": {
			      "database": "neondb",
			      "host": "example.com",
			      "port": 5432,
			      "scheme": "postgresql",
			      "user": "test",
			    },
			    "origin_connection_limit": 25,
			  },
			  {
			    "caching": {
			      "disabled": true,
			    },
			    "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
			    "name": "new-db",
			    "origin": {
			      "database": "mydb",
			      "host": "www.google.com",
			      "port": 3211,
			      "scheme": "postgresql",
			      "user": "dbuser",
			    },
			  },
			  {
			    "id": "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
			    "mtls": {
			      "ca_certificate_id": "1234",
			      "mtls_certificate_id": "1234",
			      "sslmode": "verify-full",
			    },
			    "name": "new-db-mtls",
			    "origin": {
			      "database": "mydb-mtls",
			      "host": "www.mtls.com",
			      "port": 3212,
			      "scheme": "pg-mtls",
			      "user": "pg-mtls",
			    },
			  },
			]
		`);
	});

	it("should handle displaying a config", async ({ expect }) => {
		mockHyperdriveGetListOrDelete();
		await runWrangler("hyperdrive get xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
		expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
			{
			  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			  "name": "test123",
			  "origin": {
			    "database": "neondb",
			    "host": "example.com",
			    "port": 5432,
			    "scheme": "postgresql",
			    "user": "test",
			  },
			  "origin_connection_limit": 25,
			}
		`);
	});

	it("should handle deleting a config", async ({ expect }) => {
		mockHyperdriveGetListOrDelete();
		// cf's delete prompts for confirmation by default — pass --force in
		// non-interactive testing mode (or use setIsTTY(false) + --force).
		await runWrangler(
			"hyperdrive delete xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --force"
		);
		expect(std.out).toMatchInlineSnapshot(`""`);
		expect(std.err).toMatchInlineSnapshot(`""`);
	});

	// wrangler's `update` was a PATCH with selective body (only changed
	// fields). cf's `hyperdrive update` is a full PUT (all fields required).
	// The PATCH equivalent is `cf hyperdrive update <id>`. All update tests
	// below are rewritten to drive `cf hyperdrive update` against the same
	// mocked PATCH endpoint.
	it("should handle updating a hyperdrive config's origin", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		// `cf hyperdrive update` does NOT have --origin-host / --origin-port
		// flags (forge schema only includes caching / mtls / name /
		// origin-connection-limit on the patch operation). Origin updates
		// must go through --body.
		await runWrangler(
			`hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --body='{"origin":{"host":"example.com","port":1234}}'`
		);
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "origin": {
			    "host": "example.com",
			    "port": 1234,
			  },
			}
		`);
	});

	it("should handle updating a hyperdrive config's user", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			`hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --body='{"origin":{"user":"newuser","password":"passw0rd!"}}'`
		);
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "origin": {
			    "password": "passw0rd!",
			    "user": "newuser",
			  },
			}
		`);
	});

	// cf has no per-flag validation requiring all-or-nothing origin fields
	// at create-time — required fields are `--name`, `--origin-database`,
	// `--origin-password`, `--origin-scheme`, `--origin-user`, and yargs
	// surfaces the standard "Missing required argument" error. Wrangler's
	// custom prose ("You must provide a password for the origin database")
	// is wrangler-only.
	it.skip("should throw an exception when creating a hyperdrive config but not all fields are set", async () => {});

	// Same as above for the patch path — cf's `edit` doesn't validate that
	// origin updates include all sub-fields. Wrangler-only.
	it.skip("should throw an exception when updating a hyperdrive config's origin but not all fields are set", async () => {});

	it("should handle updating a hyperdrive config's caching settings", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			"hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --caching-max-age=30 --caching-stale-while-revalidate=15"
		);
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "caching": {
			    "max_age": 30,
			    "stale_while_revalidate": 15,
			  },
			}
		`);
	});

	it("should handle disabling caching for a hyperdrive config", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			"hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --caching-disabled=true"
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "caching": {
			    "disabled": true,
			  },
			}
		`);
	});

	it("should handle updating a hyperdrive config's origin_connection_limit", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			"hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --origin-connection-limit=100"
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "origin_connection_limit": 100,
			}
		`);
	});

	it("should handle updating a hyperdrive config's name", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			"hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --name=new-name"
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "name": "new-name",
			}
		`);
	});

	it("should handle updating a hyperdrive to a hyperdrive over access config given the right parameters", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			`hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --body='{"origin":{"host":"example.com","database":"mydb","user":"newuser","password":"passw0rd!","access_client_id":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.access","access_client_secret":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}}'`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "origin": {
			    "access_client_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.access",
			    "access_client_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
			    "database": "mydb",
			    "host": "example.com",
			    "password": "passw0rd!",
			    "user": "newuser",
			  },
			}
		`);
	});

	it("should handle updating a hyperdrive config to use a VPC service ID", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			`hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --body='{"origin":{"service_id":"yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"}}'`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "origin": {
			    "service_id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
			  },
			}
		`);
	});

	it("should handle updating a hyperdrive config to use a VPC service ID with database credentials", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			`hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --body='{"origin":{"service_id":"yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy","database":"newdb","user":"newuser","password":"passw0rd!"}}'`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "origin": {
			    "database": "newdb",
			    "password": "passw0rd!",
			    "service_id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
			    "user": "newuser",
			  },
			}
		`);
	});

	// cf's `edit` doesn't enforce wrangler's "must provide nonzero origin
	// port" / "must provide an origin hostname" rules — origin shape is
	// passed verbatim via --body. Wrangler-only.
	it.skip("should throw an exception when updating a hyperdrive config's origin but neither port nor access credentials are provided", async () => {});
	it.skip("should throw an exception when updating a hyperdrive config's origin with access credentials but no other origin fields", async () => {});
	it.skip("should reject an update command if the access client ID is provided but not the access client secret", async () => {});
	it.skip("should reject an update command if the access client secret is provided but not the access client ID", async () => {});

	it("should handle updating a hyperdrive config's mtls configuration", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			"hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --mtls-ca-certificate-id=2345 --mtls-certificate-id=234 --mtls-sslmode=verify-full"
		);
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "ca_certificate_id": "2345",
			    "mtls_certificate_id": "234",
			    "sslmode": "verify-full",
			  },
			}
		`);
	});

	it("should handle updating a PostgreSQL hyperdrive config's SSL settings without re-specifying origin (verify-ca)", async ({
		expect,
	}) => {
		const reqProm = mockHyperdriveUpdate();
		await runWrangler(
			"hyperdrive update xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx --mtls-sslmode=verify-ca --mtls-ca-certificate-id=abc123"
		);
		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "mtls": {
			    "ca_certificate_id": "abc123",
			    "sslmode": "verify-ca",
			  },
			}
		`);
	});

	// MySQL uppercase sslmode values not accepted by cf — wrangler-only.
	it.skip("should handle updating a MySQL hyperdrive config's SSL settings without re-specifying origin (VERIFY_CA)", async () => {});
	it.skip("should handle updating a MySQL hyperdrive config's SSL settings without re-specifying origin (VERIFY_IDENTITY)", async () => {});
	it.skip("should handle updating a MySQL hyperdrive config's SSL settings without re-specifying origin (REQUIRED)", async () => {});
});

const defaultConfig: HyperdriveConfig = {
	id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
	name: "test123",
	origin: {
		scheme: "postgresql",
		host: "example.com",
		port: 5432,
		database: "neondb",
		user: "test",
	},
	origin_connection_limit: 25,
};

/** Create a mock handler for Hyperdrive API */
function mockHyperdriveGetListOrDelete() {
	msw.use(
		http.get(
			"*/accounts/:accountId/hyperdrive/configs/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			() => {
				return HttpResponse.json(createFetchResult(defaultConfig, true));
			},
			{ once: true }
		),
		http.delete(
			"*/accounts/:accountId/hyperdrive/configs/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			() => {
				return HttpResponse.json(createFetchResult(null, true));
			},
			{ once: true }
		),
		http.get(
			"*/accounts/:accountId/hyperdrive/configs",
			() => {
				return HttpResponse.json(
					createFetchResult(
						[
							defaultConfig,
							{
								id: "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
								name: "new-db",
								origin: {
									host: "www.google.com",
									port: 3211,
									database: "mydb",
									user: "dbuser",
									scheme: "postgresql",
								},
								caching: {
									disabled: true,
								},
							},
							{
								id: "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz",
								name: "new-db-mtls",
								origin: {
									host: "www.mtls.com",
									port: 3212,
									database: "mydb-mtls",
									user: "pg-mtls",
									scheme: "pg-mtls",
								},
								mtls: {
									ca_certificate_id: "1234",
									mtls_certificate_id: "1234",
									sslmode: "verify-full",
								},
							},
						],
						true
					)
				);
			},
			{ once: true }
		)
	);
}

/** Create a mock handler for Hyperdrive API */
function mockHyperdriveUpdate(
	configOverride?: HyperdriveConfig
): Promise<PatchHyperdriveBody> {
	const mockConfig = configOverride ?? defaultConfig;
	return new Promise((resolve) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/hyperdrive/configs/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
				() => {
					return HttpResponse.json(createFetchResult(mockConfig, true));
				},
				{ once: true }
			),
			http.patch(
				"*/accounts/:accountId/hyperdrive/configs/:configId",
				async ({ request }) => {
					const reqBody = (await request.json()) as PatchHyperdriveBody;

					resolve(reqBody);

					let origin = mockConfig.origin;
					if (reqBody.origin) {
						const {
							password: _,
							access_client_secret: _2,
							...reqOrigin
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
						} = reqBody.origin as any;
						origin = { ...origin, ...reqOrigin };
						if (reqOrigin.service_id) {
							delete origin.host;
							delete origin.port;
							delete origin.access_client_id;
							delete origin.access_client_secret;
						} else if (reqOrigin.port) {
							delete origin.access_client_id;
							delete origin.access_client_secret;
						} else if (
							reqOrigin.access_client_id ||
							reqOrigin.access_client_secret
						) {
							delete origin.port;
						}
					}
					const mtls = mockConfig.mtls;
					if (mtls && reqBody.mtls) {
						mtls.ca_certificate_id = reqBody.mtls.ca_certificate_id;
						mtls.mtls_certificate_id = reqBody.mtls.mtls_certificate_id;
					}

					return HttpResponse.json(
						createFetchResult(
							{
								id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
								name: reqBody.name ?? mockConfig.name,
								origin,
								caching: reqBody.caching ?? mockConfig.caching,
								mtls: reqBody.mtls,
								origin_connection_limit:
									reqBody.origin_connection_limit ??
									mockConfig.origin_connection_limit,
							},
							true
						)
					);
				},
				{ once: true }
			)
		);
	});
}

/** Create a mock handler for Hyperdrive API */
function mockHyperdriveCreate(): Promise<CreateUpdateHyperdriveBody> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/hyperdrive/configs",
				async ({ request }) => {
					const reqBody = (await request.json()) as CreateUpdateHyperdriveBody;

					resolve(reqBody);

					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const reqOrigin = reqBody.origin as any;
					return HttpResponse.json(
						createFetchResult(
							{
								id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
								name: reqBody.name,
								origin: {
									host: reqOrigin?.host,
									port: reqOrigin?.port,
									database: reqOrigin?.database,
									scheme: reqOrigin?.scheme,
									user: reqOrigin?.user,
									access_client_id: reqOrigin?.access_client_id,
									service_id: reqOrigin?.service_id,
								},
								caching: reqBody.caching,
								mtls: reqBody.mtls,
								origin_connection_limit: reqBody.origin_connection_limit,
							},
							true
						)
					);
				},
				{ once: true }
			)
		);
	});
}
