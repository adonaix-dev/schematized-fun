# Schematized-Fn

Bring strict types to runtime! Define complex function signatures and overloads using any Standard Schema library and enjoy full TypeScript inference.

---

[![NPM version](https://img.shields.io/npm/v/safe-context.svg?logo=npm&logoColor=red&color=red&label=NPM)](https://www.npmjs.com/package/schematized-fn)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg?logo=github)](https://opensource.org/licenses/MIT)

## Motivation

TypeScript provides excellent static safety, but this protection vanishes at runtime, often forcing developers to write manual validation logic for external inputs. Additionally, implementing function overloads is cumbersome, typically requiring a single broad signature with complex control flow to determine which overload was invoked.

This package addresses these challenges by using Standard Schema V1 definitions. It ensures that arguments strictly match their expected types before the function runs and automatically dispatches calls to the correct implementation based on the validated input, seamlessly supporting function overloads.

## Installation

```bash
# npm
npm install schematized-fn

# bun
bun add schematized-fn

# yarn
yarn add schematized-fn

# pnpm
pnpm add schematized-fn
```

## Reference Documentation

### `SchematizedFunction<This, Args, Return>`

Represents a function wrapper that automatically validates its arguments using Standard Schema V1 schemas before execution.

- **Constructor:** `private constructor()`

#### Static Methods

- **`create(schema, implementation)`**

    Creates a new [`SchematizedFunction`](/readme.md#schematizedfunctionthis-args-return) instance.

    | **Parameter**    | **Type**                    | **Description**                                                                                        |
    | ---------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
    | `schema`         | `SchematizedArgsDefinition` | The definition of the arguments schemas. To define a rest parameter, wrap the last schema in an array. |
    | `implementation` | `SchematizedImplementation` | The implementation of the function.                                                                    |

    **Returns:** [`SchematizedFunction`](/readme.md#schematizedfunctionthis-args-return)

#### Instance Methods

- **`apply(thisArg, args)`**

    Executes the function with the provided arguments and `this` context, performing synchronous validation.

    | **Parameter** | **Type**                     | **Description**                                           |
    | ------------- | ---------------------------- | --------------------------------------------------------- |
    | `thisArg`     | `ThisArg<This>`              | The `this` context for the function execution.            |
    | `args`        | `SchematizedInputArgs<Args>` | The input arguments to validate and pass to the function. |

    **Returns:** The return value of the implemented function.

    **Throws:**
    - [`SynchronousValidationError`](/readme.md#synchronousvalidationerror): If any schema requires asynchronous validation.

    - [`ArgumentsError`](/readme.md#argumentserror): If validation fails.

- **`applyAsync(thisArg, args)`**

    Executes the function with the provided arguments and `this` context, performing asynchronous validation.

    | **Parameter** | **Type**                     | **Description**                                           |
    | ------------- | ---------------------------- | --------------------------------------------------------- |
    | `thisArg`     | `ThisArg<This>`              | The `this` context for the function execution.            |
    | `args`        | `SchematizedInputArgs<Args>` | The input arguments to validate and pass to the function. |

    **Returns:** A promise resolving to the return value of the implemented function.

    **Throws:**
    - [`ArgumentsError`](/readme.md#argumentserror): If validation fails.

- **`call(thisArg, ...args)`**

    Calls the function with the provided arguments and `this` context (spread syntax), performing synchronous validation.

    | **Parameter** | **Type**                        | **Description**      |
    | ------------- | ------------------------------- | -------------------- |
    | `thisArg`     | `ThisArg<This>`                 | The `this` context.  |
    | `args`        | `...SchematizedInputArgs<Args>` | The input arguments. |

    **Returns:** The return value of the function.

    **Throws:**
    - [`SynchronousValidationError`](/readme.md#synchronousvalidationerror): If any schema requires asynchronous validation.

    - [`ArgumentsError`](/readme.md#argumentserror): If validation fails.

- **`callAsync(thisArg, ...args)`**

    Calls the function with the provided arguments and `this` context (spread syntax), performing asynchronous validation.

    | **Parameter** | **Type**                        | **Description**      |
    | ------------- | ------------------------------- | -------------------- |
    | `thisArg`     | `ThisArg<This>`                 | The `this` context.  |
    | `args`        | `...SchematizedInputArgs<Args>` | The input arguments. |

    **Returns:** A promise resolving to the return value.

    **Throws:**
    - [`ArgumentsError`](/readme.md#argumentserror): If validation fails.

- **`toFunction()`**

    Bundles the validation schemas and the implementation into a single synchronous closure.

    **Returns:** A function that can be called directly.

- **`toAsyncFunction()`**

    Bundles the validation schemas and the implementation into a single asynchronous closure.

    **Returns:** An async function that can be called directly.

### `SchematizedOverloads<This, Overloads>`

Represents a function that supports multiple signatures (overloads), validating arguments against Standard Schema V1 definitions to determine the correct implementation to execute.

- **Constructor:** `private constructor()`

#### Static Methods

- **`create()`**

    Creates a new [`SchematizedOverloads`](/readme.md#schematizedoverloadsthis-overloads) instance.

    **Returns:** [`SchematizedOverloads`](/readme.md#schematizedoverloadsthis-overloads)

#### Instance Methods

- **`prepend(schema, implementation)`**

    Registers a new overload signature with **higher** priority (it will be checked before existing overloads).

    | **Parameter**    | **Type**                    | **Description**                                                |
    | ---------------- | --------------------------- | -------------------------------------------------------------- |
    | `schema`         | `SchematizedArgsDefinition` | The definition of the arguments schemas.                       |
    | `implementation` | `SchematizedImplementation` | The implementation of the function for this specific overload. |

    **Returns:** **A new instance** with the added overload at the beginning.

- **`append(schema, implementation)`**

    Registers a new overload signature with **lower** priority (it will be checked after existing overloads).

    | **Parameter**    | **Type**                    | **Description**                                                |
    | ---------------- | --------------------------- | -------------------------------------------------------------- |
    | `schema`         | `SchematizedArgsDefinition` | The definition of the arguments schemas.                       |
    | `implementation` | `SchematizedImplementation` | The implementation of the function for this specific overload. |

    **Returns:** **A new instance** with the added overload at the end.

- **`apply(thisArg, args)`**

    Executes the function by finding the first matching overload for the provided arguments synchronously.

    | **Parameter** | **Type**                    | **Description**      |
    | ------------- | --------------------------- | -------------------- |
    | `thisArg`     | `ThisArg<This>`             | The `this` context.  |
    | `args`        | `SchematizedOverloadedArgs` | The input arguments. |

    **Returns:** The return value of the matched overload implementation.

    **Throws:**
    - [`NoMatchingOverloadError`](/readme.md#nomatchingoverloaderror): If no overload matches the provided arguments.

- **`applyAsync(thisArg, args)`**

    Executes the function by finding the first matching overload for the provided arguments asynchronously.

    | **Parameter** | **Type**                    | **Description**      |
    | ------------- | --------------------------- | -------------------- |
    | `thisArg`     | `ThisArg<This>`             | The `this` context.  |
    | `args`        | `SchematizedOverloadedArgs` | The input arguments. |

    **Returns:** The return value of the matched overload implementation.

    **Throws:**
    - [`NoMatchingOverloadError`](/readme.md#nomatchingoverloaderror): If no overload matches the provided arguments.

- **`call(thisArg, ...args)`**

    Calls the function synchronously with the provided arguments (spread syntax).

    | **Parameter** | **Type**                       | **Description**      |
    | ------------- | ------------------------------ | -------------------- |
    | `thisArg`     | `ThisArg<This>`                | The `this` context.  |
    | `args`        | `...SchematizedOverloadedArgs` | The input arguments. |

    **Returns:** The return value of the matched overload.

    **Throws:**
    - [`NoMatchingOverloadError`](/readme.md#nomatchingoverloaderror): If no overload matches the provided arguments.

- **`callAsync(thisArg, ...args)`**

    Calls the function asynchronously with the provided arguments (spread syntax).

    | **Parameter** | **Type**                       | **Description**      |
    | ------------- | ------------------------------ | -------------------- |
    | `thisArg`     | `ThisArg<This>`                | The `this` context.  |
    | `args`        | `...SchematizedOverloadedArgs` | The input arguments. |

    **Returns:** The return value of the matched overload.

    **Throws:**
    - [`NoMatchingOverloadError`](/readme.md#nomatchingoverloaderror): If no overload matches the provided arguments.

- **`toFunction()`**

    Bundles the registered overloads into a single closure that handles dispatching.

    **Returns:** A function that can be called directly.

- **`toAsyncFunction()`**

    Bundles the registered overloads into a single asynchronous closure that handles dispatching.

    **Returns:** An async function that can be called directly.

### `SchematizedArgs<Args>`

A utility class for validating a list of arguments against a defined tuple of Standard Schema V1 schemas.

- **Constructor:** `private constructor()`

#### Static Methods

- **`create(schema)`**

    Creates a new [`SchematizedArgs`](/readme.md#schematizedargsargs) instance.

    | **Parameter** | **Type**                    | **Description**                                                                                        |
    | ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
    | `schema`      | `SchematizedArgsDefinition` | The definition of the arguments schemas. To define a rest parameter, wrap the last schema in an array. |

    **Returns:** [`SchematizedArgs`](/readme.md#schematizedargsargs)

#### Instance Methods

- **`parse(args)`**

    Validates the provided arguments against the defined schemas synchronously.

    | **Parameter** | **Type**                     | **Description**                  |
    | ------------- | ---------------------------- | -------------------------------- |
    | `args`        | `SchematizedInputArgs<Args>` | The input arguments to validate. |

    **Returns:** The validated and transformed output arguments.

    **Throws:**
    - [`SynchronousValidationError`](/readme.md#synchronousvalidationerror): If any schema requires asynchronous validation.

    - [`ArgumentsError`](/readme.md#argumentserror): If validation fails.

- **`parseAsync(args)`**

    Validates the provided arguments against the defined schemas asynchronously.

    | **Parameter** | **Type**                     | **Description**                  |
    | ------------- | ---------------------------- | -------------------------------- |
    | `args`        | `SchematizedInputArgs<Args>` | The input arguments to validate. |

    **Returns:** A promise that resolves to the validated and transformed output arguments.

    **Throws:**
    - [`ArgumentsError`](/readme.md#argumentserror): If validation fails.

### `SchematizedError`

Base error class for all errors thrown by `schematized-fn` package.

### `ArgumentsError`

Error thrown when arguments fail validation against a schema.

- **Extends:** [`SchematizedError`](/readme.md#schematizederror)

- **Constructor:** `constructor(issues)`

    | **Parameter** | **Type**              | **Description**                            |
    | ------------- | --------------------- | ------------------------------------------ |
    | `issues`      | `StdSchemaV1.Issue[]` | The list of validation issues encountered. |

#### Properties

| **Property**      | **Type**                       | **Description**                            |
| ----------------- | ------------------------------ | ------------------------------------------ |
| `readonly issues` | `readonly StdSchemaV1.Issue[]` | The list of validation issues encountered. |

### `NoMatchingOverloadError`

Error thrown when no overload signature matches the provided arguments.

- **Extends:** [`SchematizedError`](/readme.md#schematizederror)

- **Constructor:** `constructor(failures)`

    | **Parameter** | **Type**                                           | **Description**                                                       |
    | ------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
    | `failures`    | `(ArgumentsError \| SynchronousValidationError)[]` | The list of errors encountered for each overload signature attempted. |

#### Properties

| **Property**     | **Type**                                           | **Description**                                                                                                                                                |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `readonly cause` | `(ArgumentsError \| SynchronousValidationError)[]` | The list of errors encountered for each overload signature attempted. The index of the error corresponds to the index of the overload in the definition order. |

### `SynchronousValidationError`

Error thrown when a synchronous validation method (e.g., `parse`, `apply`) is called, but the underlying schema implementation requires asynchronous validation (returns a Promise).

- **Extends:** [`SchematizedError`](/readme.md#schematizederror)

- **Constructor:** `constructor()`
