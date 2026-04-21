import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Package, Plus, Edit, Trash2, Loader2, ImageIcon, ArrowLeft, X } from 'lucide-react';

export default function Products() {
  const [view, setView] = useState('list');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const initialState = { id: null, name: '', description: '', price: '', promo_price: '', category_id: '', images: [], colors: '', sizes: '', is_featured: false };
  const [product, setProduct] = useState(initialState);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const storeData = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');
  const token = localStorage.getItem('@SaaS:token');

 const fetchData = async () => {
    if (!storeData.id) return;
    try {
      const fetchOptions = { headers: { 'Authorization': `Bearer ${token}` } };
      const [prodRes, catRes] = await Promise.all([
        fetch(`http://localhost:3000/api/stores/${storeData.id}/products`, fetchOptions),
        fetch(`http://localhost:3000/api/stores/${storeData.id}/categories`, fetchOptions)
      ]);
      
      const prodData = await prodRes.json();
      const catData = await catRes.json(); // Lemos a fita apenas UMA vez e guardamos na variável!
      
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, [storeData.id]);

  // Upload de Múltiplas Imagens
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    
    const uploadedUrls = [];
    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('http://localhost:3000/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        const data = await response.json();
        if (response.ok) uploadedUrls.push(data.url);
      } catch (error) { console.error(error); }
    }
    
    setProduct(prev => ({ ...prev, images: [...(prev.images || []), ...uploadedUrls] }));
    setUploading(false);
  };

  const removeImage = (indexToRemove) => {
    setProduct(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isEditing = !!product.id;
    const url = isEditing ? `http://localhost:3000/api/products/${product.id}` : 'http://localhost:3000/api/products';
    
    const payload = {
      ...product, store_id: storeData.id,
      variations: JSON.stringify({ colors: product.colors.split(',').map(c => c.trim()).filter(c => c), sizes: product.sizes.split(',').map(s => s.trim()).filter(s => s) })
    };

    try {
      const response = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (response.ok) {
        alert(isEditing ? "Produto atualizado!" : "Produto cadastrado!");
        setProduct(initialState);
        setView('list');
        fetchData();
      }
    } catch (error) { alert("Erro de conexão."); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apagar produto?")) return;
    await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchData();
  };

  const editProduct = (p) => {
    let parsedColors = '', parsedSizes = '', parsedImages = [];
    if (p.variations) {
      const v = typeof p.variations === 'string' ? JSON.parse(p.variations) : p.variations;
      parsedColors = v.colors ? v.colors.join(', ') : '';
      parsedSizes = v.sizes ? v.sizes.join(', ') : '';
    }
    if (p.images) parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
    else if (p.image_url) parsedImages = [p.image_url]; // Fallback pra foto antiga

    setProduct({ ...p, promo_price: p.promotional_price || '', colors: parsedColors, sizes: parsedSizes, images: parsedImages, is_featured: !!p.is_featured });
    setView('form');
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, display: 'flex', gap: '10px' }}><Package/> {view === 'list' ? 'Produtos' : 'Novo Produto'}</h1>
          {view === 'list' ? <button onClick={() => { setProduct(initialState); setView('form'); }} className="admin-btn" style={{ width: 'auto' }}><Plus/> Adicionar</button> : <button onClick={() => setView('list')} className="admin-btn" style={{ width: 'auto', background: '#64748b' }}><ArrowLeft/> Voltar</button>}
        </header>

        {view === 'list' ? (
          <div className="admin-card">
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid #eee' }}><th>Produto</th><th>Preço</th><th>Ações</th></tr></thead>
              <tbody>
                {products.map(p => {
                  const imgs = p.images ? JSON.parse(p.images) : (p.image_url ? [p.image_url] : []);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 0', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {imgs.length > 0 ? <img src={imgs[0]} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} /> : <ImageIcon color="#ccc"/>}
                        {p.name}
                      </td>
                      <td>R$ {p.promotional_price || p.price}</td>
                      <td>
                        <button onClick={() => editProduct(p)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '5px' }}><Edit size={18}/></button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-card">
            {/* Galeria de Imagens */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold' }}>Fotos do Produto (Selecione várias)</label>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                {product.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 100, height: 100 }}>
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                    <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer' }}><X size={14} /></button>
                  </div>
                ))}
                <label style={{ width: 100, height: 100, border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                  {uploading ? <Loader2 className="animate-spin" /> : <Plus color="#94a3b8" size={30} />}
                  <input type="file" hidden multiple onChange={handleMultipleImageUpload} accept="image/*" />
                </label>
              </div>
            </div>

            <div className="admin-form-row">
              <div><label>Nome</label><input required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className="admin-input" /></div>
              <div>
                <label>Categoria</label>
                <select value={product.category_id} onChange={e => setProduct({...product, category_id: e.target.value})} className="admin-input">
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}><label>Descrição</label><textarea rows="3" value={product.description} onChange={e => setProduct({...product, description: e.target.value})} className="admin-input"></textarea></div>

            <div className="admin-form-row">
              <div><label>Preço R$</label><input type="number" step="0.01" required value={product.price} onChange={e => setProduct({...product, price: e.target.value})} className="admin-input" /></div>
              <div><label>Preço Promocional R$</label><input type="number" step="0.01" value={product.promo_price} onChange={e => setProduct({...product, promo_price: e.target.value})} className="admin-input" /></div>
            </div>

            <div className="admin-form-row" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
              <div><label>Cores (Separadas por vírgula)</label><input placeholder="Ex: Preto, Branco" value={product.colors} onChange={e => setProduct({...product, colors: e.target.value})} className="admin-input" /></div>
              <div><label>Tamanhos (Separados por vírgula)</label><input placeholder="Ex: P, M, G" value={product.sizes} onChange={e => setProduct({...product, sizes: e.target.value})} className="admin-input" /></div>
            </div>

            <button type="submit" disabled={loading} className="admin-btn" style={{ marginTop: '20px' }}>{loading ? 'Salvando...' : 'Salvar Produto'}</button>
          </form>
        )}
      </main>
    </div>
  );
}