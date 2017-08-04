const { Workflow, introduce, build, quadify, gc } = require("megaminx");

async function quadifyFn(ctx) {
	await ctx.run(introduce, "major", { from: "|" });
	await ctx.run(quadify, "major");
	await ctx.run(build, "major", { to: "|" });
}

const main = async function() {
	const flow = new Workflow({});
	await flow.run(quadifyFn);
};

main().catch(console.log);
