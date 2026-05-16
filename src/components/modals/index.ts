import { useEffect } from 'react';

export const getProducts = async (type: string) => {
  try {
    const productsResponse = await fetch(`/api/products?type=${type}`);

    if (!productsResponse.ok) {
      const message = `HTTP error! status: ${productsResponse.status}`;
      // throw new Error(message);/
    }

    const productsData = await productsResponse.json();
    return productsData;
  } catch (error) {
    console.error('Fetching products failed:', error);
    return undefined;
  }
};
