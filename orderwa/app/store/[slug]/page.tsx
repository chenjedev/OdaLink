export default async function ShopStore({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return(
        <div>
            <p>Welcome {slug} shop</p>
        </div>
    );
}