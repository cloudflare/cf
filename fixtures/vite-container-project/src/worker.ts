import { DurableObject } from "cloudflare:workers";

interface Env {
	CONTAINER: DurableObjectNamespace<ContainerDO>;
}

export class ContainerDO extends DurableObject<Env> {
	readonly #container: Container;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		if (!ctx.container) {
			throw new Error("The Container runtime is not attached");
		}
		this.#container = ctx.container;
	}

	override async fetch(request: Request): Promise<Response> {
		if (!this.#container.running) {
			this.#container.start();
		}

		const containerUrl = new URL(request.url);
		containerUrl.protocol = "http:";
		return this.#container
			.getTcpPort(8080)
			.fetch(new Request(containerUrl, request));
	}
}

export default {
	async fetch(request, env): Promise<Response> {
		const id = env.CONTAINER.idFromName("production-fixture");
		return env.CONTAINER.get(id).fetch(request);
	},
} satisfies ExportedHandler<Env>;
