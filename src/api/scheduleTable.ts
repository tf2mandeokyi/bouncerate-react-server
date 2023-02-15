import { fetchFromApi, NumberRange } from ".";


export interface ScheduleTable {
    table: (number | null)[][];
}
export interface TimeSlotBounceRate {
    onlyDefault: number;
    withAlt: number;
    needsUpdate: boolean;
}
export interface AlternativeStreamCalculationResult {
    altStreams: (number | null)[];
    bounceRate: TimeSlotBounceRate;
}


export async function getTable() : Promise<ScheduleTable> {
    let response = await fetchFromApi(`/api/v1/scheduleTable`);
    return await response.json();
}

export async function setStreamSchedule(slotId: number, streamNumber: number, categoryId: number) {
    await fetchFromApi(
        `/api/v1/scheduleTable?slotId=${slotId}&streamNumber=${streamNumber}&categoryId=${categoryId}`, {
        method: 'POST'
    });
}

export async function deleteStreamSchedule(slotId: number, streamNumber: number) {
    await fetchFromApi(`/api/v1/scheduleTable?slotId=${slotId}&streamNumber=${streamNumber}`, {
        method: 'DELETE'
    });
}

export async function calculateAlternativeStreams(slotId: number, bounceRateRange: NumberRange) {
    let response = await fetchFromApi(`/api/v1/scheduleTable/alternatives?slotId=${slotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bounceRateRange)
    })
    return await response.json() as AlternativeStreamCalculationResult;
}

export async function calculateTimeSlotBounceRate(slotId: number, bounceRateRange: NumberRange) {
    let response = await fetchFromApi(`/api/v1/scheduleTable/bounceRate?slotId=${slotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bounceRateRange)
    })
    return await response.json() as TimeSlotBounceRate;
}

export async function getAllTimeSlotBounceRates() {
    let response = await fetchFromApi(`/api/v1/scheduleTable/bounceRate`)
    return await response.json() as (TimeSlotBounceRate | null)[];
}