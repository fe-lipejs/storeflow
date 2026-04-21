import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Tags, Plus, Trash2 } from 'lucide-react';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    const storeData = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');
    const token = localStorage.getItem('@SaaS:token');

    const fetchCategories = () => {
        if (storeData.id) {
            fetch(`http://localhost:3000/api/stores/${storeData.id}/categories`, {
                // 👇 AGORA ENVIAMOS O CRACHÁ!
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    // 👇 Se o backend devolver a lista, salvamos. Se devolver erro, salvamos lista vazia.
                    if (Array.isArray(data)) {
                        setCategories(data);
                    } else {
                        setCategories([]);
                    }
                })
                .catch(err => console.error("Erro ao buscar categorias:", err));
        }
    };

    useEffect(() => { fetchCategories(); }, [storeData.id]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            await fetch('http://localhost:3000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ store_id: storeData.id, name: newCategory })
            });
            setNewCategory('');
            fetchCategories();
        } catch (error) { alert('Erro ao criar categoria.'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apagar esta categoria? Os produtos nela ficarão sem categoria.")) return;
        try {
            await fetch(`http://localhost:3000/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) { alert("Erro ao apagar."); }
    };

    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                <header style={{ marginBottom: '30px' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px' }}>
                        <Tags size={28} /> Gerenciar Categorias          </h1>
                </header>

                <div className="admin-card" style={{ maxWidth: '600px' }}>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <input type="text" placeholder="Nome da nova categoria (ex: Camisetas)" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="admin-input" required />
                        <button type="submit" className="admin-btn" style={{ width: 'auto', padding: '0 25px', backgroundColor: '#10b981' }}>
                            <Plus size={20} /> Adicionar
                        </button>
                    </form>

                    <div>
                        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', color: '#475569' }}>Categorias Atuais</h3>
                        {categories.length === 0 ? <p style={{ color: '#94a3b8' }}>Nenhuma categoria criada.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {categories.map(c => (
                                    <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{c.name}</span>
                                        <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}