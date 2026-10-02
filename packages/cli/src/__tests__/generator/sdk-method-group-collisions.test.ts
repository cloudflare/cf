import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { dropSdkMethodGroupCollisions } from "../../../generator/sdk-method-group-collisions.js";

describe("dropSdkMethodGroupCollisions", () => {
	it("keeps a leaf method and drops its colliding resource accessor", () => {
		const sdkDir = mkdtempSync(join(tmpdir(), "cf-sdk-collision-"));
		const clientDir = join(
			sdkDir,
			"api/resources/magicTransit/resources/prefixes/client"
		);
		mkdirSync(clientDir, { recursive: true });
		const clientPath = join(clientDir, "Client.ts");
		writeFileSync(
			clientPath,
			`import { DeleteClient } from "../resources/delete/client/Client.js";

export class PrefixesClient {
    protected _delete: DeleteClient | undefined;

    public get delete(): DeleteClient {
        return (this._delete ??= new DeleteClient(this._options));
    }

    public delete(request: DeleteRequest): Promise<void> {
        return this.__delete(request);
    }
}
`
		);
		writeFileSync(
			join(sdkDir, "sdk-map.json"),
			JSON.stringify({
				deletePrefix: {
					accessor: ["magicTransit", "prefixes"],
					method: "delete",
				},
				deletePrefixesForAccount: {
					accessor: ["magicTransit", "prefixes", "delete", "for"],
					method: "account",
				},
			})
		);
		writeFileSync(
			join(sdkDir, "sdk-operation-types.ts"),
			`export interface SdkOperationRequestMap {
  "deletePrefix": DeleteRequest;
  "deletePrefixesForAccount": DeleteAllRequest;
}
`
		);

		const result = dropSdkMethodGroupCollisions(sdkDir);

		expect(result).toEqual({
			collisions: 1,
			droppedOperationIds: ["deletePrefixesForAccount"],
		});
		const client = readFileSync(clientPath, "utf8");
		expect(client).toContain("public delete(");
		expect(client).not.toContain("public get delete");
		expect(client).not.toContain("DeleteClient");
		expect(readFileSync(join(sdkDir, "sdk-map.json"), "utf8")).not.toContain(
			"deletePrefixesForAccount"
		);
		expect(
			readFileSync(join(sdkDir, "sdk-operation-types.ts"), "utf8")
		).not.toContain("deletePrefixesForAccount");
	});
});
