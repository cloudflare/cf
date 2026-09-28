import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { mockAccountId, mockApiToken } from "./helpers/mock-account-id";
import { mockConsoleMethods } from "./helpers/mock-console";
import { clearDialogs } from "./helpers/mock-dialogs";
import { useMockIsTTY } from "./helpers/mock-istty";
import { createFetchResult, msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

// Inline minimal types — wrangler's `../vpc/index` and `../vpc/validation`
// don't exist in cf. cf calls the same API (`/accounts/:id/connectivity/
// directory/services`) via the generated `cf workers-vpc services
// {create,get,update,delete,list}` commands.
type ServiceType = "http" | "tcp";

interface ConnectivityServiceHostNetwork {
	tunnel_id: string;
}

interface ConnectivityServiceHostResolverNetwork {
	tunnel_id: string;
	resolver_ips?: string[];
}

interface ConnectivityServiceHost {
	ipv4?: string;
	ipv6?: string;
	hostname?: string;
	network?: ConnectivityServiceHostNetwork;
	resolver_network?: ConnectivityServiceHostResolverNetwork;
}

interface ConnectivityService {
	service_id: string;
	type: ServiceType;
	name: string;
	tcp_port?: number;
	http_port?: number;
	https_port?: number;
	app_protocol?: string;
	host: ConnectivityServiceHost;
	tls_settings?: { cert_verification_mode: string };
	created_at: string;
	updated_at: string;
}

interface ConnectivityServiceRequest {
	type: ServiceType;
	name: string;
	tcp_port?: number;
	http_port?: number;
	https_port?: number;
	app_protocol?: string;
	host: ConnectivityServiceHost;
	tls_settings?: { cert_verification_mode: string };
}

// cf's `workers-vpc services {create,update}` command exposes
// only top-level body flags (`--name`, `--type`,
// `--tls-settings-cert-verification-mode`, `--http-port`, `--https-port`,
// `--app-protocol`, `--tcp-port`). It does NOT have flags for the
// `host` shape (`--ipv4`, `--ipv6`, `--hostname`, `--tunnel-id`,
// `--resolver-ips`) — those have to be supplied via `--body` JSON. The
// per-flag body assembly also enforces all three required-field guards
// BEFORE the `if (argv.body)` short-circuit, so callers must still pass
// dummy `--name`, `--type`, `--tls-settings-cert-verification-mode`
// values alongside `--body`. Tracked in
// `test_bugs/connectivity-services-missing-host-flags.md` and
// `test_bugs/connectivity-services-overrequired-create-update.md`.
//
// Wrangler-specific stdout (`🚧 Creating VPC service ...` /
// `📋 Listing VPC services` etc.) and validation errors raised
// client-side don't apply to cf — cf forwards the body verbatim and
// lets the API surface invalid shapes.

describe.skip("vpc help", () => {
	// Wrangler-only: cf has no `cf vpc` command group. The equivalent
	// cf surface is `cf workers-vpc services {create,get,
	// update,delete,list}`, so wrangler's `vpc` and `vpc service` help
	// snapshots have no cf analogue.
	it.skip("should show help text when no arguments are passed", async () => {});
	it.skip("should show service help text when no service arguments are passed", async () => {});
});

describe("vpc service commands", () => {
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

	it("should handle creating an HTTP service with IPv4", async ({ expect }) => {
		// Fixed: `connectivity-services-missing-host-flags` (per-flag
		// `--host-*` shape now generated),
		// `connectivity-services-overrequired-create-update` (top-level
		// `--tls-settings-cert-verification-mode` no longer required), and
		// `body-params-required-within-optional-parent` (group-implies
		// `.check()`). The per-flag form works as long as BOTH
		// `--host-network-tunnel-id` and `--host-resolver-network-tunnel-id`
		// are passed together (the generator's group-implies check requires
		// both required leaves whenever any `--host-*` flag is set), so the
		// posted body carries `host.resolver_network.tunnel_id` alongside
		// `host.network.tunnel_id`.
		const reqProm = mockWvpcServiceCreate();
		await runWrangler(
			"workers-vpc services create --name test-http-ipv4 --type http --host-ipv4 10.0.0.1 --host-network-tunnel-id 550e8400-e29b-41d4-a716-446655440000 --host-resolver-network-tunnel-id 550e8400-e29b-41d4-a716-446655440099"
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.1",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			    "resolver_network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440099",
			    },
			  },
			  "name": "test-http-ipv4",
			  "type": "http",
			}
		`);
	});

	it("should handle creating an HTTP service with IPv4 (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-http-ipv4",
			type: "http",
			host: {
				ipv4: "10.0.0.1",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-http-ipv4 --type http --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.1",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "name": "test-http-ipv4",
			  "type": "http",
			}
		`);
	});

	it("should handle creating a service with hostname and resolver network (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-hostname",
			type: "http",
			http_port: 80,
			host: {
				hostname: "db.example.com",
				resolver_network: {
					tunnel_id: "550e8400-e29b-41d4-a716-446655440002",
					resolver_ips: ["8.8.8.8", "8.8.4.4"],
				},
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-hostname --type http --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "hostname": "db.example.com",
			    "resolver_network": {
			      "resolver_ips": [
			        "8.8.8.8",
			        "8.8.4.4",
			      ],
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440002",
			    },
			  },
			  "http_port": 80,
			  "name": "test-hostname",
			  "type": "http",
			}
		`);
	});

	it("should reject service creation with both IP addresses and hostname", async ({
		expect,
	}) => {
		// Fixed: `connectivity-services-missing-host-flags`. The per-flag
		// `--host-*` shape now carries the derived `oneOf` conflicts table
		// (`--host-ipv4` ⊕ `--host-hostname`), so cf rejects the
		// mutually-exclusive combination at parse time via yargs'
		// `.conflicts()` — no client-side validation helper needed.
		await expect(() =>
			runWrangler(
				"workers-vpc services create --name test-conflict --type http --host-ipv4 10.0.0.1 --host-hostname db.example.com --host-network-tunnel-id 550e8400-e29b-41d4-a716-446655440000 --host-resolver-network-tunnel-id 550e8400-e29b-41d4-a716-446655440099"
			)
		).rejects.toThrow(/mutually exclusive/);
	});

	it("should handle listing services", async ({ expect }) => {
		mockWvpcServiceList();
		await runWrangler("workers-vpc services list");

		// cf prints JSON; wrangler's table-formatted stdout has no
		// equivalent.
		expect(JSON.parse(std.out)).toEqual([mockService]);
	});

	it("should handle getting a service", async ({ expect }) => {
		mockWvpcServiceGetUpdateDelete();
		await runWrangler("workers-vpc services get service-uuid");

		expect(JSON.parse(std.out)).toEqual(mockService);
	});

	it("should handle deleting a service", async ({ expect }) => {
		mockWvpcServiceGetUpdateDelete();
		await runWrangler("workers-vpc services delete service-uuid --force");

		// cf surfaces null SDK results silently — successLabel goes to
		// stderr only on TTY.
		expect(std.out).toMatchInlineSnapshot(`""`);
	});

	it("should handle updating a service (via --body)", async ({ expect }) => {
		const reqProm = mockWvpcServiceUpdate();
		const body = JSON.stringify({
			name: "test-updated",
			type: "http",
			http_port: 80,
			host: {
				ipv4: "10.0.0.2",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440001" },
			},
		});
		await runWrangler(
			`workers-vpc services update service-uuid --name test-updated --type http --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.2",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440001",
			    },
			  },
			  "http_port": 80,
			  "name": "test-updated",
			  "type": "http",
			}
		`);
	});

	it("should handle getting a service without resolver_ips", async ({
		expect,
	}) => {
		const serviceWithoutResolverIps: ConnectivityService = {
			...mockService,
			host: {
				hostname: "web.example.com",
				resolver_network: {
					tunnel_id: "tunnel-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
					// No resolver_ips property
				},
			},
		};

		msw.use(
			http.get(
				"*/accounts/:accountId/connectivity/directory/services/:serviceId",
				() => {
					return HttpResponse.json(
						createFetchResult(serviceWithoutResolverIps, true)
					);
				},
				{ once: true }
			)
		);

		await runWrangler("workers-vpc services get service-uuid");

		expect(JSON.parse(std.out)).toEqual(serviceWithoutResolverIps);
	});

	it("should handle creating a service and display without resolver_ips (via --body)", async ({
		expect,
	}) => {
		const serviceResponse = {
			service_id: "service-uuid",
			type: "http",
			name: "test-no-resolver",
			http_port: 80,
			https_port: 443,
			host: {
				hostname: "db.example.com",
				resolver_network: {
					tunnel_id: "550e8400-e29b-41d4-a716-446655440002",
					// No resolver_ips
				},
			},
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		};

		msw.use(
			http.post(
				"*/accounts/:accountId/connectivity/directory/services",
				() => {
					return HttpResponse.json(createFetchResult(serviceResponse, true));
				},
				{ once: true }
			)
		);

		const body = JSON.stringify({
			name: "test-no-resolver",
			type: "http",
			host: {
				hostname: "db.example.com",
				resolver_network: {
					tunnel_id: "550e8400-e29b-41d4-a716-446655440002",
				},
			},
		});

		await runWrangler(
			`workers-vpc services create --name test-no-resolver --type http --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		expect(JSON.parse(std.out)).toEqual(serviceResponse);
	});

	it("should handle creating a TCP service with IPv4 (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-tcp-db",
			type: "tcp",
			tcp_port: 5432,
			host: {
				ipv4: "10.0.0.5",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-tcp-db --type tcp --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.5",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "name": "test-tcp-db",
			  "tcp_port": 5432,
			  "type": "tcp",
			}
		`);
	});

	it("should handle creating a TCP service with hostname (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-tcp-hostname",
			type: "tcp",
			tcp_port: 3306,
			host: {
				hostname: "mysql.internal",
				resolver_network: {
					tunnel_id: "550e8400-e29b-41d4-a716-446655440001",
					resolver_ips: ["10.0.0.1"],
				},
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-tcp-hostname --type tcp --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "hostname": "mysql.internal",
			    "resolver_network": {
			      "resolver_ips": [
			        "10.0.0.1",
			      ],
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440001",
			    },
			  },
			  "name": "test-tcp-hostname",
			  "tcp_port": 3306,
			  "type": "tcp",
			}
		`);
	});

	it.skip(
		"should reject TCP service creation without --tcp-port"
		// Wrangler-only client-side validation. cf's `--tcp-port` is
		// optional at the flag layer; the API decides.
	);

	it("should handle updating a TCP service (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceUpdate();
		const body = JSON.stringify({
			name: "test-tcp-updated",
			type: "tcp",
			tcp_port: 5433,
			host: {
				ipv4: "10.0.0.6",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440001" },
			},
		});
		await runWrangler(
			`workers-vpc services update service-uuid --name test-tcp-updated --type tcp --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.6",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440001",
			    },
			  },
			  "name": "test-tcp-updated",
			  "tcp_port": 5433,
			  "type": "tcp",
			}
		`);
	});

	it("should handle getting a TCP service", async ({ expect }) => {
		mockWvpcTcpServiceGet();
		await runWrangler("workers-vpc services get tcp-service-uuid");

		expect(JSON.parse(std.out)).toEqual(mockTcpService);
	});

	it("should handle listing TCP services", async ({ expect }) => {
		mockWvpcTcpServiceList();
		await runWrangler("workers-vpc services list");

		expect(JSON.parse(std.out)).toEqual([mockTcpService]);
	});

	it("should handle creating a TCP service with --app-protocol postgresql (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-pg",
			type: "tcp",
			tcp_port: 5432,
			app_protocol: "postgresql",
			host: {
				ipv4: "10.0.0.5",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-pg --type tcp --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "app_protocol": "postgresql",
			  "host": {
			    "ipv4": "10.0.0.5",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "name": "test-pg",
			  "tcp_port": 5432,
			  "type": "tcp",
			}
		`);
	});

	it("should handle creating a TCP service with --app-protocol mysql (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-mysql",
			type: "tcp",
			tcp_port: 3306,
			app_protocol: "mysql",
			host: {
				ipv4: "10.0.0.6",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-mysql --type tcp --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "app_protocol": "mysql",
			  "host": {
			    "ipv4": "10.0.0.6",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "name": "test-mysql",
			  "tcp_port": 3306,
			  "type": "tcp",
			}
		`);
	});

	it("should reject --app-protocol with invalid value", async ({ expect }) => {
		// cf's `--app-protocol` enum is enforced by yargs (choices:
		// ["postgresql", "mysql"]). cf's `.fail(msg => throw)` handler
		// surfaces yargs' "Invalid values" message via the thrown
		// Error; nothing is written to stderr (different from
		// wrangler, which prints the formatted error box).
		await expect(() =>
			runWrangler(
				"workers-vpc services create --name test-bad-proto --type tcp --tls-settings-cert-verification-mode verify_full --tcp-port 5432 --app-protocol redis"
			)
		).rejects.toThrow(
			/Invalid values:[\s\S]*Argument: app-protocol, Given: "redis", Choices: "postgresql", "mysql"/
		);
	});

	it("should handle updating a TCP service with --app-protocol (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceUpdate();
		const body = JSON.stringify({
			name: "test-pg-updated",
			type: "tcp",
			tcp_port: 5432,
			app_protocol: "postgresql",
			host: {
				ipv4: "10.0.0.5",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services update service-uuid --name test-pg-updated --type tcp --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "app_protocol": "postgresql",
			  "host": {
			    "ipv4": "10.0.0.5",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "name": "test-pg-updated",
			  "tcp_port": 5432,
			  "type": "tcp",
			}
		`);
	});

	it("should handle creating a TCP service with --tls-settings-cert-verification-mode verify_ca (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-tcp-tls",
			type: "tcp",
			tcp_port: 5432,
			tls_settings: { cert_verification_mode: "verify_ca" },
			host: {
				ipv4: "10.0.0.5",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-tcp-tls --type tcp --tls-settings-cert-verification-mode verify_ca --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.5",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "name": "test-tcp-tls",
			  "tcp_port": 5432,
			  "tls_settings": {
			    "cert_verification_mode": "verify_ca",
			  },
			  "type": "tcp",
			}
		`);
	});

	it("should handle creating an HTTP service with --tls-settings-cert-verification-mode disabled (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceCreate();
		const body = JSON.stringify({
			name: "test-http-tls",
			type: "http",
			http_port: 80,
			tls_settings: { cert_verification_mode: "disabled" },
			host: {
				ipv4: "10.0.0.1",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440000" },
			},
		});
		await runWrangler(
			`workers-vpc services create --name test-http-tls --type http --tls-settings-cert-verification-mode disabled --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.1",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			  },
			  "http_port": 80,
			  "name": "test-http-tls",
			  "tls_settings": {
			    "cert_verification_mode": "disabled",
			  },
			  "type": "http",
			}
		`);
	});

	it("should not include tls_settings when --cert-verification-mode is not specified", async ({
		expect,
	}) => {
		// Fixed: `connectivity-services-overrequired-create-update`.
		// `--tls-settings-cert-verification-mode` is no longer required, so
		// the per-flag form can omit it entirely — the assembled body then
		// carries no `tls_settings` key (the API defaults to verify_full).
		const reqProm = mockWvpcServiceCreate();
		await runWrangler(
			"workers-vpc services create --name test-no-tls --type http --host-ipv4 10.0.0.1 --host-network-tunnel-id 550e8400-e29b-41d4-a716-446655440000 --host-resolver-network-tunnel-id 550e8400-e29b-41d4-a716-446655440099"
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.1",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440000",
			    },
			    "resolver_network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440099",
			    },
			  },
			  "name": "test-no-tls",
			  "type": "http",
			}
		`);
	});

	it("should handle getting a service with tls_settings", async ({
		expect,
	}) => {
		const serviceWithTls: ConnectivityService = {
			...mockTcpService,
			tls_settings: {
				cert_verification_mode: "verify_ca",
			},
		};

		msw.use(
			http.get(
				"*/accounts/:accountId/connectivity/directory/services/:serviceId",
				() => {
					return HttpResponse.json(createFetchResult(serviceWithTls, true));
				},
				{ once: true }
			)
		);

		await runWrangler("workers-vpc services get tcp-service-uuid");

		expect(JSON.parse(std.out)).toEqual(serviceWithTls);
	});

	it("should handle updating a service with --tls-settings-cert-verification-mode (via --body)", async ({
		expect,
	}) => {
		const reqProm = mockWvpcServiceUpdate();
		const body = JSON.stringify({
			name: "test-updated",
			type: "http",
			http_port: 80,
			tls_settings: { cert_verification_mode: "verify_full" },
			host: {
				ipv4: "10.0.0.2",
				network: { tunnel_id: "550e8400-e29b-41d4-a716-446655440001" },
			},
		});
		await runWrangler(
			`workers-vpc services update service-uuid --name test-updated --type http --tls-settings-cert-verification-mode verify_full --body ${JSON.stringify(body)}`
		);

		await expect(reqProm).resolves.toMatchInlineSnapshot(`
			{
			  "host": {
			    "ipv4": "10.0.0.2",
			    "network": {
			      "tunnel_id": "550e8400-e29b-41d4-a716-446655440001",
			    },
			  },
			  "http_port": 80,
			  "name": "test-updated",
			  "tls_settings": {
			    "cert_verification_mode": "verify_full",
			  },
			  "type": "http",
			}
		`);
	});

	// The current API schema no longer gives this field an enum, so cf
	// forwards invalid values instead of rejecting them before the request.
	it.todo("should reject --cert-verification-mode with invalid value");

	it.skip(
		"should extract port from hostname for TCP services"
		// Wrangler-only: extracting `:3306` from `--hostname
		// mysql.internal:3306` is a wrangler client-side helper. cf
		// passes the host shape through verbatim via `--body`.
	);

	it.skip(
		"should accept matching --tcp-port when hostname also includes port"
		// Same wrangler-only helper as above.
	);

	it.skip(
		"should reject conflicting --tcp-port and hostname port"
		// Same wrangler-only helper as above.
	);
});

// Wrangler-only: `extractPortFromHostname`, `validateHostname`, and
// `validateRequest` live in wrangler's `vpc/validation.ts` and have no
// cf equivalent — cf forwards bodies verbatim and lets the API surface
// invalid inputs.
describe.skip("extractPortFromHostname", () => {
	it.skip("should extract port from hostname:port", () => {});
	it.skip("should return undefined port for plain hostname", () => {});
	it.skip("should not extract port from IPv6 addresses", () => {});
	it.skip("should not extract port from bracketed IPv6 addresses", () => {});
	it.skip("should handle port at boundary values", () => {});
	it.skip("should reject port 0 or above 65535", () => {});
});

describe.skip("hostname validation", () => {
	it.skip("should accept valid hostnames", () => {});
	it.skip("should reject empty hostname", () => {});
	it.skip("should reject hostname exceeding 253 characters", () => {});
	it.skip("should accept hostname at exactly 253 characters", () => {});
	it.skip("should reject hostname with URL scheme", () => {});
	it.skip("should reject hostname with path", () => {});
	it.skip("should reject bare IPv4 address", () => {});
	it.skip("should reject bare IPv6 address", () => {});
	it.skip("should reject hostname with port", () => {});
	it.skip("should reject hostname with whitespace", () => {});
	it.skip("should accept hostnames with underscores", () => {});
	it.skip("should report all applicable errors at once", () => {});
	it.skip("should reject invalid hostname via wrangler service create", async () => {});
	it.skip("should reject IP address as hostname via wrangler service create", async () => {});
});

describe.skip("IP address validation", () => {
	it.skip("should accept valid IPv4 addresses", () => {});
	it.skip("should reject invalid IPv4 addresses", () => {});
	it.skip("should accept valid IPv6 addresses", () => {});
	it.skip("should reject invalid IPv6 addresses", () => {});
	it.skip("should accept valid resolver IPs", () => {});
	it.skip("should reject invalid resolver IPs", () => {});
});

const mockService: ConnectivityService = {
	service_id: "service-uuid",
	type: "http",
	name: "test-web-service",
	http_port: 80,
	https_port: 443,
	host: {
		hostname: "web.example.com",
		resolver_network: {
			tunnel_id: "tunnel-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
			resolver_ips: ["8.8.8.8", "8.8.4.4"],
		},
	},
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
};

const mockTcpService: ConnectivityService = {
	service_id: "tcp-service-uuid",
	type: "tcp",
	name: "test-tcp-service",
	tcp_port: 5432,
	app_protocol: "postgresql",
	host: {
		ipv4: "10.0.0.5",
		network: {
			tunnel_id: "550e8400-e29b-41d4-a716-446655440000",
		},
	},
	created_at: "2024-01-01T00:00:00Z",
	updated_at: "2024-01-01T00:00:00Z",
};

// Mock API Handlers
function mockWvpcServiceCreate(): Promise<ConnectivityServiceRequest> {
	return new Promise((resolve) => {
		msw.use(
			http.post(
				"*/accounts/:accountId/connectivity/directory/services",
				async ({ request }) => {
					const reqBody = (await request.json()) as ConnectivityServiceRequest;
					resolve(reqBody);

					return HttpResponse.json(
						createFetchResult(
							{
								service_id: "service-uuid",
								type: reqBody.type,
								name: reqBody.name,
								tcp_port: reqBody.tcp_port,
								app_protocol: reqBody.app_protocol,
								http_port: reqBody.http_port,
								https_port: reqBody.https_port,
								host: reqBody.host,
								tls_settings: reqBody.tls_settings,
								created_at: "2024-01-01T00:00:00Z",
								updated_at: "2024-01-01T00:00:00Z",
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

function mockWvpcServiceUpdate(): Promise<ConnectivityServiceRequest> {
	return new Promise((resolve) => {
		msw.use(
			http.put(
				"*/accounts/:accountId/connectivity/directory/services/:serviceId",
				async ({ request }) => {
					const reqBody = (await request.json()) as ConnectivityServiceRequest;
					resolve(reqBody);

					return HttpResponse.json(
						createFetchResult(
							{
								service_id: "service-uuid",
								type: reqBody.type,
								name: reqBody.name,
								tcp_port: reqBody.tcp_port,
								app_protocol: reqBody.app_protocol,
								http_port: reqBody.http_port,
								https_port: reqBody.https_port,
								host: reqBody.host,
								tls_settings: reqBody.tls_settings,
								created_at: "2024-01-01T00:00:00Z",
								updated_at: "2024-01-01T00:00:00Z",
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

function mockWvpcServiceGetUpdateDelete() {
	msw.use(
		http.get(
			"*/accounts/:accountId/connectivity/directory/services/:serviceId",
			() => {
				return HttpResponse.json(createFetchResult(mockService, true));
			},
			{ once: true }
		),
		http.delete(
			"*/accounts/:accountId/connectivity/directory/services/:serviceId",
			() => {
				return HttpResponse.json(createFetchResult(null, true));
			},
			{ once: true }
		)
	);
}

function mockWvpcServiceList() {
	msw.use(
		http.get(
			"*/accounts/:accountId/connectivity/directory/services",
			() => {
				return HttpResponse.json(createFetchResult([mockService], true));
			},
			{ once: true }
		)
	);
}

function mockWvpcTcpServiceGet() {
	msw.use(
		http.get(
			"*/accounts/:accountId/connectivity/directory/services/:serviceId",
			() => {
				return HttpResponse.json(createFetchResult(mockTcpService, true));
			},
			{ once: true }
		)
	);
}

function mockWvpcTcpServiceList() {
	msw.use(
		http.get(
			"*/accounts/:accountId/connectivity/directory/services",
			() => {
				return HttpResponse.json(createFetchResult([mockTcpService], true));
			},
			{ once: true }
		)
	);
}
