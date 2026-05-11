import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProductForm() {
  const { id }   = useParams()
  const { vendor } = useAuth()
  const navigate   = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', description: '', price: '', compare_price: '',
    stock: '', sku: '', status: 'draft', category_id: '', image_url: ''
  })
  const [categories, setCategories] = useState([])
  const [uploading, setUploading]   = useState(false)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
    if (isEdit) {
      supabase.from('products').select('*').eq('id', id).single()
        .then(({ data }) => data && setForm({ ...data, price: data.price?.toString(), compare_price: data.compare_price?.toString() || '', stock: data.stock?.toString() }))
    }
  }, [id])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  async function uploadImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${vendor.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (error) { toast.error('Erreur upload'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
    toast.success('Image uploadée !')
  }

  async function submit(e) {
    e.preventDefault()
    if (!vendor) return
    setLoading(true)
    const payload = {
      ...form,
      vendor_id: vendor.id,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
    }
    let error
    if (isEdit) {
      ({ error } = await supabase.from('products').update(payload).eq('id', id))
    } else {
      ({ error } = await supabase.from('products').insert(payload))
    }
    if (error) toast.error('Erreur : ' + error.message)
    else { toast.success(isEdit ? 'Produit mis à jour !' : 'Produit créé !'); navigate('/vendor/produits') }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="page-title">{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="section-title">Informations</h2>
            <div>
              <label className="label">Nom du produit *</label>
              <input name="name" value={form.name} onChange={handle} required className="input" placeholder="Ex: iPhone 15 Pro" />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea name="description" value={form.description} onChange={handle} required className="input" rows={4} placeholder="Décrivez votre produit..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prix (€) *</label>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handle} required className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">Prix barré (€)</label>
                <input name="compare_price" type="number" step="0.01" value={form.compare_price} onChange={handle} className="input" placeholder="0.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Stock *</label>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handle} required className="input" placeholder="0" />
              </div>
              <div>
                <label className="label">SKU</label>
                <input name="sku" value={form.sku} onChange={handle} className="input" placeholder="REF-001" />
              </div>
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select name="category_id" value={form.category_id} onChange={handle} className="input">
                <option value="">Sélectionner...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Statut</label>
              <div className="flex gap-3">
                {[['draft','Brouillon'],['published','Publié']].map(([val, lbl]) => (
                  <label key={val} className={`flex-1 text-center py-2 rounded-xl border-2 cursor-pointer transition-all ${form.status === val ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-gray-200 text-gray-500'}`}>
                    <input type="radio" name="status" value={val} checked={form.status === val} onChange={handle} className="sr-only" />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 py-3 justify-center">
              {loading ? 'Enregistrement...' : isEdit ? '✅ Mettre à jour' : '✅ Créer le produit'}
            </button>
            <button type="button" onClick={() => navigate('/vendor/produits')} className="btn btn-ghost">Annuler</button>
          </div>
        </div>

        {/* Colonne droite — image */}
        <div className="card p-6 h-fit">
          <h2 className="section-title">Image principale</h2>

          {form.image_url ? (
            <div className="relative rounded-xl overflow-hidden aspect-square mb-4">
              <img src={form.image_url} alt="Aperçu" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
                <X size={16} className="text-danger" />
              </button>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all mb-4">
              <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" disabled={uploading} />
              <Upload size={32} className="text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">{uploading ? 'Upload en cours...' : 'Cliquer ou glisser une image'}</p>
              <p className="text-gray-400 text-xs mt-1">PNG, JPG — Max 5 Mo</p>
            </label>
          )}

          <div>
            <label className="label">Ou URL directe</label>
            <input name="image_url" value={form.image_url} onChange={handle} className="input" placeholder="https://..." />
          </div>
        </div>
      </form>
    </div>
  )
}
