import { supabase } from "../../lib/supabase"

export default async function Test() {
    const { data, error } = await supabase.from('products').select('*')
    return <pre>{JSON.stringify({data, error} , null, 2) }</pre>
}