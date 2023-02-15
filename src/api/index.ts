const BOUNCERATE_API_SERVER = process.env['REACT_APP_BOUNCERATE_API_SERVER_LINK'] ?? ''

export interface ErrorMessage {
    error: string;
    statusCode: number;
    timestamp: Date;
}

export interface NumberRange {
    min: number;
    max: number;
}

export function isInstanceOfErrorMessage(object: any) : object is ErrorMessage {
    return 'error' in object && 'statusCode' in object && 'timestamp' in object;
}

export async function fetchFromApi(input: RequestInfo | URL, init?: RequestInit | undefined) {
    try {       
        let response = await fetch(`${BOUNCERATE_API_SERVER}${input}`, init);
        if(!response.ok) throw await response.json();
        return response;
    } catch(e) {
        if(isInstanceOfErrorMessage(e)) alert(e.error);
        throw e;
    }
}