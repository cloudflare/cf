import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, it, vi } from "vite-plus/test";
import { dispatchLocal, disposeLocalSession } from "../../lib/local-runtime.js";

const runtime = vi.hoisted(() => ({
	dispatchFetch: vi.fn<(url: string, init: RequestInit) => Promise<Response>>(),
	dispose: vi.fn<() => Promise<void>>(),
}));

vi.mock("miniflare", () => ({
	Miniflare: class {
		dispatchFetch = runtime.dispatchFetch;
		dispose = runtime.dispose;
	},
}));

runInTempDir();
afterEach(disposeLocalSession);

it("strips authentication headers before forwarding to the local runtime", async ({
	expect,
}) => {
	runtime.dispatchFetch.mockResolvedValue(
		Response.json({ success: true, result: [] })
	);
	await dispatchLocal(
		new Request(
			"https://api.cloudflare.com/client/v4/accounts/local/storage/kv/namespaces",
			{
				headers: {
					authorization: "Bearer token",
					"x-AUTH-key": "global-key",
					Accept: "application/json",
				},
			}
		),
		"state"
	);

	expect(runtime.dispatchFetch).toHaveBeenCalledOnce();
	const [, init] = runtime.dispatchFetch.mock.calls[0] ?? [];
	const headers = new Headers(init?.headers);
	expect(headers.has("authorization")).toBe(false);
	expect(headers.has("x-auth-key")).toBe(false);
	expect(headers.get("accept")).toBe("application/json");
	expect(headers.get("host")).toBe("localhost");
});
