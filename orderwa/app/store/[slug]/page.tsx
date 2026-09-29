import ProductList from "../../components/ProductList";

export default async function ShopStore({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return(
        <main className="store-page">
            <header className="store-header">
            <h1  className="store-title">{slug} store</h1>
            <p className="store-subtitle">Order . pay . delivery</p>
            </header>

            <ProductList shopSlug={slug} />
        </main>
    );
}