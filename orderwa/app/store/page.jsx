import { supabase } from '../../lib/supabase'
import ProductList from '../components/ProductList'

export default async function StorePage() {
  const { data, error } = await supabase.from('products').select('*')
  if (error) console.error(error) 

  return <ProductList products= { data ?? [] } />

  }
