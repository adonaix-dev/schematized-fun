/**
 * Base error class for all errors thrown by `schematized-fun`
 * package.
 */
abstract class SchematizedError extends Error {
    override name = "SchematizedError";
}

export { SchematizedError };
