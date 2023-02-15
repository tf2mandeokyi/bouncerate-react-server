import { fetchFromApi } from ".";


export interface ProductCategory {
    id: number;
    name: string;
}


export async function getCategory(id: number) : Promise<ProductCategory> {
    let response = await fetchFromApi(`/api/v1/categories/${id}`);
    return await response.json();
}


export async function addCategory(params: { name: string, availability: boolean }) {
    await fetchFromApi('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
}


export async function deleteCategory(id: number) {
    await fetchFromApi(`/api/v1/categories/${id}`, {
        method: 'DELETE'
    });
}


export async function getPriority(params?: {
    count?: number, 
    forceUpdate?: boolean 
}) : Promise<ProductCategory[]> {

    let count = params?.count ?? 3;
    let forceUpdate = params?.forceUpdate ?? false;
    let response = await fetchFromApi(
        `/api/v1/categories/getPriority?count=${count}&forceUpdate=${forceUpdate}`
    );
    return await response.json();
}


export async function getAllCategories() : Promise<ProductCategory[]> {
    let response = await fetchFromApi(`/api/v1/categories`);
    return await response.json();
}


export async function getCategoriesPage(count: number, pageNum: number) : Promise<ProductCategory[]> {
    let response = await fetchFromApi(`/api/v1/categories?count=${count}&page=${pageNum}`);
    return await response.json();
}


export async function getCategoriesCount() : Promise<number> {
    let response = await fetchFromApi(`/api/v1/categories/count`);
    return (await response.json())['value'];
}