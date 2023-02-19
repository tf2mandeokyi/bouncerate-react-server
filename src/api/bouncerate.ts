import { fetchFromApi } from "."

type NumbersOnlyObject = { [x: string]: number }

export async function getBounceRate({ categoryId, setTopBoxId }: NumbersOnlyObject)
 : Promise<number | null> {
    let response = await fetchFromApi(`/api/v1/bounceRates/category/${categoryId}/${setTopBoxId}`);
    return (await response.json())['value'];
}

export async function setBounceRate({ categoryId, setTopBoxId }: NumbersOnlyObject, bounceRate: number) : Promise<void> {
    await fetchFromApi(`/api/v1/bounceRates/category/${categoryId}/${setTopBoxId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bounceRate)
    });
}

export async function randomizeBounceRateOfCategory(categoryId: number) : Promise<void> {
    await fetchFromApi(`/api/v1/bounceRates/category/${categoryId}/randomize`, {
        method: 'POST'
    });
}

export async function randomizeBounceRateOfSetTopBox(setTopBoxId: number) : Promise<void> {
    await fetchFromApi(`/api/v1/bounceRates/setTopBox/${setTopBoxId}/randomize`, {
        method: 'POST'
    });
}