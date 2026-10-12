/** An operation of the OpenAPI document, with Forge's extensions. */
export type OpenApiOperation = Record<string, unknown> & {
	operationId?: string;
	responses?: Record<string, unknown>;
	parameters?: unknown[];
};

/** The Forge OpenAPI document the commands are generated from. */
export interface ForgeOpenApiDocument {
	paths?: Record<
		string,
		Record<string, OpenApiOperation | undefined> | undefined
	>;
	components?: { parameters?: Record<string, unknown> } & Record<
		string,
		unknown
	>;
	"x-forge-commands"?: Record<string, unknown>;
	[key: string]: unknown;
}
