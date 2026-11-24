declare module "cliui" {
	type Column =
		| string
		| {
				text: string;
				width?: number;
				padding?: [number, number, number, number];
				align?: "right";
		  };
	export default function cliui(options: { width: number; wrap: boolean }): {
		div(...columns: Column[]): void;
		span(...columns: Column[]): void;
		toString(): string;
	};
}
