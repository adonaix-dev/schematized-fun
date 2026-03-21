import { ArgumentsError } from "~/Error/ArgumentsError";
import { NoMatchingOverloadError } from "~/Error/NoMatchingOverloadError";
import { SynchronousValidationError } from "~/Error/SynchronousValidationError";
import type { SchematizedArgsDefinition } from "~/Types/Definition/SchematizedArgsDefinition";
import type { SchematizedImplementation } from "~/Types/Function/SchematizedImplementation";
import type { OverloadBranch } from "~/Types/Overload/Internal/OverloadBranch";
import type { SchematizedOverloadedArgs } from "~/Types/Overload/SchematizedOverloadedArgs";
import type { SchematizedOverloadedAsyncFunction } from "~/Types/Overload/SchematizedOverloadedAsyncFunction";
import type { SchematizedOverloadedFunction } from "~/Types/Overload/SchematizedOverloadedFunction";
import type { SchematizedOverloadedReturn } from "~/Types/Overload/SchematizedOverloadedReturn";
import type { SchematizedOverloadSignature } from "~/Types/Overload/SchematizedOverloadSignature";
import type { ThisArg } from "~/Types/ThisArg";

import { SchematizedTuple } from "./Tuple/SchematizedTuple";

/**
 * Represents a function that supports multiple signatures
 * (overloads), validating arguments against Standard Schema V1
 * definitions to determine the correct implementation to execute.
 *
 * @template This The type of the `this` context.
 * @template Overloads The list of registered overloads.
 */
class SchematizedOverloads<
    This,
    Overloads extends readonly SchematizedOverloadSignature[] = [],
> {
    #branches: OverloadBranch[];

    private constructor(...branches: OverloadBranch[]) {
        this.#branches = branches;
    }

    /**
     * Creates a new
     * {@link SchematizedOverloads `SchematizedOverloads`} instance.
     */
    static create<This = void>(): SchematizedOverloads<This> {
        return new SchematizedOverloads();
    }

    /**
     * Registers a new overload signature with **higher** priority (it
     * will be checked before existing overloads).
     *
     * @param schema The definition of the arguments schemas.
     * @param implementation The implementation of the function for
     *   this specific overload.
     *
     * @returns **A new instance** with the added overload at the
     *   beginning.
     */
    prepend<const As extends SchematizedArgsDefinition, R>(
        schema: As,
        implementation: SchematizedImplementation<This, As, R>,
    ): SchematizedOverloads<This, [SchematizedOverloadSignature<As, R>, ...Overloads]> {
        return new SchematizedOverloads(
            {
                schema: new SchematizedTuple(schema),
                implementation,
            },
            ...this.#branches,
        );
    }

    /**
     * Registers a new overload signature with **lower** priority (it
     * will be checked after existing overloads).
     *
     * @param schema The definition of the arguments schemas.
     * @param implementation The implementation of the function for
     *   this specific overload.
     *
     * @returns **A new instance** with the added overload at the end.
     */
    append<const As extends SchematizedArgsDefinition, R>(
        schema: As,
        implementation: SchematizedImplementation<This, As, R>,
    ): SchematizedOverloads<This, [...Overloads, SchematizedOverloadSignature<As, R>]> {
        return new SchematizedOverloads(...this.#branches, {
            schema: new SchematizedTuple(schema),
            implementation,
        });
    }

    /**
     * Executes the function by finding the first matching overload
     * for the provided arguments synchronously.
     *
     * @param thisArg The `this` context.
     * @param args The input arguments.
     *
     * @returns The return value of the matched overload
     *   implementation.
     * @throws {NoMatchingOverloadError} If no overload matches the
     *   provided arguments.
     */
    apply<As extends SchematizedOverloadedArgs<Overloads>>(
        thisArg: ThisArg<This>,
        args: As,
    ): SchematizedOverloadedReturn<Overloads, As> {
        const failures: (ArgumentsError | SynchronousValidationError)[] = new Array(
            this.#branches.length,
        );

        for (let i = 0; i < this.#branches.length; i++) {
            const { schema, implementation } = this.#branches[i]!;
            const result = schema.validate(args);

            if (result instanceof Promise)
                failures.push(new SynchronousValidationError());
            else if (result.issues) failures[i] = new ArgumentsError(result.issues);
            else {
                return Reflect.apply(implementation, thisArg, result.value);
            }
        }

        throw new NoMatchingOverloadError(failures);
    }

    /**
     * Executes the function by finding the first matching overload
     * for the provided arguments asynchronously.
     *
     * @param thisArg The `this` context.
     * @param args The input arguments.
     *
     * @returns The return value of the matched overload
     *   implementation.
     * @throws {NoMatchingOverloadError} If no overload matches the
     *   provided arguments.
     */
    async applyAsync<As extends SchematizedOverloadedArgs<Overloads>>(
        thisArg: ThisArg<This>,
        args: As,
    ): Promise<Awaited<SchematizedOverloadedReturn<Overloads, As>>> {
        const failures: ArgumentsError[] = new Array(this.#branches.length);

        for (let i = 0; i < this.#branches.length; i++) {
            const { schema, implementation } = this.#branches[i]!;
            const result = await schema.validate(args);

            if (result.issues) failures[i] = new ArgumentsError(result.issues);
            else {
                return await Reflect.apply(implementation, thisArg, result.value);
            }
        }

        throw new NoMatchingOverloadError(failures);
    }

    /**
     * Calls the function synchronously with the provided arguments
     * (spread syntax).
     *
     * @param thisArg The `this` context.
     * @param args The input arguments.
     *
     * @returns The return value of the matched overload.
     * @throws {NoMatchingOverloadError} If no overload matches the
     *   provided arguments.
     * @see {@link apply `apply()`}
     */
    call<As extends SchematizedOverloadedArgs<Overloads>>(
        thisArg: ThisArg<This>,
        ...args: As
    ): SchematizedOverloadedReturn<Overloads, As> {
        return this.apply(thisArg, args);
    }

    /**
     * Calls the function asynchronously with the provided arguments
     * (spread syntax).
     *
     * @param thisArg The `this` context.
     * @param args The input arguments.
     *
     * @returns The return value of the matched overload.
     * @throws {NoMatchingOverloadError} If no overload matches the
     *   provided arguments.
     * @see {@link applyAsync `applyAsync()`}
     */
    async callAsync<As extends SchematizedOverloadedArgs<Overloads>>(
        thisArg: ThisArg<This>,
        ...args: As
    ): Promise<Awaited<SchematizedOverloadedReturn<Overloads, As>>> {
        return await this.applyAsync(thisArg, args);
    }

    /**
     * Bundles the registered overloads into a single closure that
     * handles dispatching.
     *
     * @returns A function that can be called directly.
     */
    toFunction(): SchematizedOverloadedFunction<This, Overloads> {
        const self = this;

        return function (this: any, ...args: any) {
            return self.apply(this, args);
        } as any;
    }

    /**
     * Bundles the registered overloads into a single asynchronous
     * closure that handles dispatching.
     *
     * @returns An async function that can be called directly.
     */
    toAsyncFunction(): SchematizedOverloadedAsyncFunction<This, Overloads> {
        const self = this;

        return async function (this: any, ...args: any) {
            return await self.applyAsync(this, args);
        } as any;
    }
}

export { SchematizedOverloads };
