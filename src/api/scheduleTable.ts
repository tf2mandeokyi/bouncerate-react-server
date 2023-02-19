import { fetchFromApi } from ".";


export interface ScheduleTable {
    [timeSlotId: string]: (number | null)[];
}
export interface ScheduleTableBounceRateNodeValue {
    bounceRate: number;
    needsUpdate: boolean;
}
export interface BounceRateTable {
    [timeSlotId: string]: (ScheduleTableBounceRateNodeValue | null)[]
}
export interface AlternativeStreamCalculationResult {
    altStreams: (number | null)[];
    bounceRateArray: (ScheduleTableBounceRateNodeValue | null)[];
}


export async function getTable() : Promise<ScheduleTable> {
    let response = await fetchFromApi(`/api/v1/scheduleTable`);
    return (await response.json())['table'];
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

export async function calculateAlternativeStreams(slotId: number, maxBounceRate: number) {
    let response = await fetchFromApi(`/api/v1/scheduleTable/alternatives?slotId=${slotId}&maxBounceRate=${maxBounceRate}`, {
        method: 'POST'
    })
    return await response.json() as AlternativeStreamCalculationResult;
}

export async function calculateTimeSlotBounceRate(slotId: number, maxBounceRate: number) {
    let response = await fetchFromApi(`/api/v1/scheduleTable/bounceRate?slotId=${slotId}&maxBounceRate=${maxBounceRate}`, {
        method: 'POST'
    })
    return await response.json() as ScheduleTableBounceRateNodeValue[];
}

export async function getBounceRateTable() : Promise<BounceRateTable> {
    let response = await fetchFromApi(`/api/v1/scheduleTable/bounceRate`)
    return (await response.json())['table'];
}