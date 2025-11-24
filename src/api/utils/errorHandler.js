/**
 * Manejo centralizado de errores de API
 */

export class APIError extends Error {
    constructor(message, provider, statusCode = null, originalError = null) {
        super(message);
        this.name = 'APIError';
        this.provider = provider;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Manejar errores de respuesta HTTP
 */
export function handleHTTPError(error, provider) {
    if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
            case 400:
                return new APIError(
                    `Bad request to ${provider}: ${data?.error?.message || 'Invalid parameters'}`,
                    provider,
                    400,
                    error
                );
            case 401:
                return new APIError(
                    `Unauthorized: ${provider} API credentials invalid or expired`,
                    provider,
                    401,
                    error
                );
            case 403:
                return new APIError(
                    `Forbidden: ${provider} API access denied`,
                    provider,
                    403,
                    error
                );
            case 404:
                return new APIError(
                    `Not found: Resource not available on ${provider}`,
                    provider,
                    404,
                    error
                );
            case 429:
                return new APIError(
                    `Rate limit exceeded for ${provider}. Try again later.`,
                    provider,
                    429,
                    error
                );
            case 500:
            case 502:
            case 503:
                return new APIError(
                    `${provider} server error. Service temporarily unavailable.`,
                    provider,
                    status,
                    error
                );
            default:
                return new APIError(
                    `${provider} API error (${status}): ${data?.error?.message || 'Unknown error'}`,
                    provider,
                    status,
                    error
                );
        }
    } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        return new APIError(
            `No response from ${provider}. Check your internet connection.`,
            provider,
            null,
            error
        );
    } else {
        // Error al configurar la petición
        return new APIError(
            `Error setting up request to ${provider}: ${error.message}`,
            provider,
            null,
            error
        );
    }
}

/**
 * Logger de errores
 */
export function logError(error) {
    if (error instanceof APIError) {
        console.error(`❌ [${error.provider}] ${error.message}`, {
            statusCode: error.statusCode,
            timestamp: error.timestamp,
        });
    } else {
        console.error('❌ Unexpected error:', error);
    }
}

/**
 * Retry con backoff exponencial
 * PHASE 1: NO retry on 403 errors (quota exceeded is permanent until next day)
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            // PHASE 1: NO retry on 4xx errors (client errors are permanent)
            // 403 = Quota exceeded or forbidden - retrying makes it worse
            // 429 = Rate limit - should respect the limit, not retry immediately
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                if (error.statusCode === 403) {
                    console.error('🚨 ERROR 403: Quota exceeded or forbidden. NO RETRIES.');
                }
                throw error; // Don't retry any 4xx errors
            }

            // Only retry on 5xx (server errors) or network issues
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

const errorHandler = {
    APIError,
    handleHTTPError,
    logError,
    retryWithBackoff,
};
