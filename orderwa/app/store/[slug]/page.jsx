import { notFound } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import ProductList from '../../components/ProductList'

export const dynamic = 'force-dynamic'

export default async function ShopStorePage({ params }) {
  const { slug } = await params

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id, name, slug, phone')
    .eq('slug', slug)
    .maybeSingle()

  if (shopError) console.error('Load shop failed:', shopError.message)
  if (!shop) notFound()

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('is_active', true)

  if (productsError) console.error('Load products failed:', productsError.message)

  return (
    <ProductList
      products={products ?? []}
      shopSlug={shop.slug}
      shopId={shop.id}
      shopName={shop.name}
      shopPhone={shop.phone}
    />
  )
}