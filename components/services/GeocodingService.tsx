export interface GeocodingResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
}

/**
 * Service to handle geocoding operations using OpenStreetMap Nominatim API
 */
export class GeocodingService {

    private static currentController: AbortController | null = null;

    private static debounceTimer: NodeJS.Timeout | null = null;

    static searchAddressThrottled(
        query: string,
        limit: number = 5,
        language: string = 'fr',
        debounceMs: number = 300
    ): Promise<GeocodingResult[]> {
        return new Promise((resolve) => {
            // Clear any existing timer
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            // Set a new timer
            this.debounceTimer = setTimeout(async () => {
                const results = await this.searchAddress(query, limit, language);
                resolve(results);
            }, debounceMs);
        });
    }

    /**
     * Search for addresses using the address string
     * @param query The address to search for
     * @param limit Maximum number of results to return
     * @param language Language for results (default: 'fr')
     * @returns Promise with the search results
     */
    static async searchAddress(
        query: string,
        limit: number = 5,
        language: string = 'fr'
    ): Promise<GeocodingResult[]> {
        try {
            // Make sure the query is substantial enough to avoid unnecessary API calls
            if (!query || query.length < 3) {
                return [];
            }

            // Cancel any existing request
            if (this.currentController) {
                this.currentController.abort();
            }

            // Create a new controller for this request
            this.currentController = new AbortController();
            const signal = this.currentController.signal;

            // Note: Nominatim ToS require an identifying User-Agent and has usage policies
            // https://operations.osmfoundation.org/policies/nominatim/
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`,
                {
                    headers: {
                        "Accept-Language": language,
                        "User-Agent": "EventApp-Educational-Project",
                    },
                    signal, // Pass the abort signal
                }
            );

            if (!response.ok) {
                throw new Error(`Error searching for address: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            // Don't log aborted requests as errors
            if (error instanceof DOMException && error.name === 'AbortError') {
                console.log('Request was cancelled');
                return [];
            }

            console.error("Error in geocoding service:", error);
            return [];
        } finally {
            // Clear the controller reference
            this.currentController = null;
        }
    }

    /**
     * Get a formatted address string for display purposes
     * @param result The geocoding result
     * @returns Formatted address string
     */
    static getFormattedAddress(result: GeocodingResult): string {
        return result.display_name;
    }

    /**
     * Extract a short name from the geocoding result (first part of the address)
     * @param result The geocoding result
     * @returns Place name
     */
    static getPlaceName(result: GeocodingResult): string {
        // Usually the first part before the first comma is the name of the place
        return result.display_name.split(',')[0].trim();
    }
}