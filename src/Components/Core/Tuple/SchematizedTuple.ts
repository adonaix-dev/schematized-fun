import type { MaybePromise } from "@adonaix/types";

import type { StdSchemaV1 } from "~/Common/StdSchemaV1";
import type { SchematizedArgsDefinition } from "~/Types/Definition/SchematizedArgsDefinition";
import type { SchematizedOutputArgs } from "~/Types/Function/SchematizedOutputArgs";

class SchematizedTuple<Args extends SchematizedArgsDefinition> {
    private readonly fixedArgs: readonly StdSchemaV1[];
    private readonly fixedArgsCount: number;

    private readonly restArgs: StdSchemaV1 | false;

    constructor(args: Args) {
        const last = args.at(-1) as StdSchemaV1 | readonly [StdSchemaV1];
        const restArgs = Array.isArray(last);

        this.restArgs = restArgs && last[0];
        this.fixedArgsCount = (this.fixedArgs = (
            restArgs ? args.slice(0, -1) : args
        ) as any).length;
    }

    private static compile(
        results: StdSchemaV1.Result<any>[],
    ): StdSchemaV1.Result<any[]> {
        const value: any[] = new Array(results.length);
        const issues: StdSchemaV1.Issue[] = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i]!;

            if (result.issues) {
                for (const issue of result.issues) {
                    issues.push({
                        ...issue,
                        path: [i, ...(issue.path || [])],
                    });
                }
            } else {
                value[i] = result.value;
            }
        }

        return issues.length ? { issues } : { value };
    }

    validate(args: any[]): MaybePromise<StdSchemaV1.Result<SchematizedOutputArgs<Args>>> {
        const results: MaybePromise<StdSchemaV1.Result<any>>[] = new Array(
            this.restArgs
                ? Math.max(args.length, this.fixedArgsCount)
                : this.fixedArgsCount,
        );

        let isAsync = false;

        for (let i = 0; i < this.fixedArgsCount; i++) {
            const result = this.fixedArgs[i]!["~standard"].validate(args[i]);

            isAsync ||= result instanceof Promise;
            results[i] = result;
        }

        if (this.restArgs && args.length > this.fixedArgsCount) {
            for (let i = this.fixedArgsCount; i < args.length; i++) {
                const result = this.restArgs["~standard"].validate(args[i]);

                isAsync ||= result instanceof Promise;
                results[i] = result;
            }
        }

        return (
            isAsync
                ? Promise.all(results).then(SchematizedTuple.compile)
                : SchematizedTuple.compile(results as StdSchemaV1.Result<any>[])
        ) as any;
    }
}

export { SchematizedTuple };
