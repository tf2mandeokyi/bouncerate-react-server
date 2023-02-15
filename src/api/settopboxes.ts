import { fetchFromApi } from ".";


export interface SetTopBox {
    id: number;
    uuid: string;
    location?: string;
}


export async function getSetTopBox(id: number) : Promise<SetTopBox> {
    let response = await fetchFromApi(`/api/v1/setTopBoxes/${id}`);
    return await response.json();
}


export async function addSetTopBox(params: { name: string }) {
    await fetchFromApi('/api/v1/setTopBoxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    })
}


export async function deleteSetTopBox(id: number) : Promise<void> {
    await fetchFromApi(`/api/v1/setTopBoxes/${id}`, {
        method: 'DELETE'
    });
}


export async function getSetTopBoxesPage(count: number, pageNum: number) : Promise<SetTopBox[]> {
    let response = await fetchFromApi(`/api/v1/setTopBoxes?count=${count}&page=${pageNum}`);
    return await response.json();
}


export async function getSetTopBoxesCount() : Promise<number> {
    let response = await fetchFromApi(`/api/v1/setTopBoxes/count`);
    return (await response.json())['value'];
}


export async function randomizeBounceRatesOfSetTopBox(id: number, minMax: { min: number, max: number }) {
    console.log(minMax);
    await fetchFromApi(`/api/v1/bounceRates/setTopBox/${id}/randomize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minMax)
    });
}