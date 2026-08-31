export default async function ShopStore({ params }) {
    const { slug } = await params;
    return(
        <div>
            <p>Welcome {slug} shop</p>
        </div>
    );
}