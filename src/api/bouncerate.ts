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