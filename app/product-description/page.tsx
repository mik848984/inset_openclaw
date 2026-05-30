import ProductDescriptionClient from './ProductDescriptionClient';

export const metadata = {
  title: 'Описание товара нейросетью — для маркетплейсов ИИСеть',
  description:
    'Готовые описания товаров для маркетплейсов и интернет-магазинов нейросетью: продающий текст, характеристики, преимущества. Wildberries, Ozon, Яндекс.Маркет.',
  alternates: {
    canonical: 'https://iiset.io/product-description',
  },
};

export default function ProductDescriptionPage() {
  return <ProductDescriptionClient />;
}
