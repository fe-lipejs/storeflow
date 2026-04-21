import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Palette, Save, Upload, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

export default function Appearance() {
  const [color, setColor] = useState('#000000');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  const storeData = JSON.parse(localStorage.getItem('@SaaS:store') || '{}');
  const token = localStorage.getItem('@SaaS:token');
  const slugDaLoja = storeData.slug;

  useEffect(() => {
    async function loadAppearance() {
      try {
        const response = await fetch(`http://localhost:3000/api/${slugDaLoja}`);
        const data = await response.json();
        if (response.ok && data.store) {
          setColor(data.store.theme_color || '#000000');
          setLogoUrl(data.store.logo_url || '');
          setBannerUrl(data.store.banner_url || '');
        }
      } catch (error) {
        console.error("Erro ao carregar aparência");
      }
    }
    if (slugDaLoja) loadAppearance();
  }, [slugDaLoja]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (type === 'logo') setLogoUrl(data.url);
        if (type === 'banner') setBannerUrl(data.url);
      }
    } catch (error) {
      alert("Erro no envio");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/stores/${slugDaLoja}/appearance`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ theme_color: color, logo_url: logoUrl, banner_url: bannerUrl })
      });
      if (response.ok) alert("Aparência salva!");
    } catch (error) {
      alert("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 800 }}>
            <Palette size={28} /> APARÊNCIA DA LOJA
          </h1>
        </header>

        <div className="admin-card" style={{ maxWidth: '700px', padding: '40px' }}>
          
          {/* SEÇÃO DA LOGO (BOLINHA) */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Logo da Loja</label>
            <label style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              backgroundColor: '#f1f5f9', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              margin: '0 auto',
              border: '2px dashed #cbd5e1',
              overflow: 'hidden',
              position: 'relative',
              transition: '0.3s'
            }} className="hover-upload">
              {uploading.logo ? (
                <Loader2 className="animate-spin" size={30} color="#64748b" />
              ) : logoUrl ? (
                <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Plus size={30} color="#94a3b8" />
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '5px' }}>UPLOAD</span>
                </>
              )}
              <input type="file" hidden onChange={(e) => handleFileUpload(e, 'logo')} accept="image/*" />
            </label>
          </div>

          {/* SEÇÃO DO BANNER (RETÂNGULO) */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Banner da Vitrine</label>
            <label style={{ 
              width: '100%', 
              height: '180px', 
              borderRadius: '12px', 
              backgroundColor: '#f1f5f9', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              border: '2px dashed #cbd5e1',
              overflow: 'hidden',
              position: 'relative',
              transition: '0.3s'
            }} className="hover-upload">
              {uploading.banner ? (
                <Loader2 className="animate-spin" size={30} color="#64748b" />
              ) : bannerUrl ? (
                <img src={bannerUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <ImageIcon size={40} color="#94a3b8" />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700, marginTop: '8px' }}>CLIQUE PARA SUBIR O BANNER</span>
                </>
              )}
              <input type="file" hidden onChange={(e) => handleFileUpload(e, 'banner')} accept="image/*" />
            </label>
          </div>

          {/* SELETOR DE COR */}
          <div style={{ marginBottom: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Cor de Identidade</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ border: 'none', width: '50px', height: '50px', cursor: 'pointer', borderRadius: '8px', background: 'none' }} />
              <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: '#000', background: '#f8fafc', padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{color.toUpperCase()}</div>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="btn-black" style={{ width: '100%', padding: '20px', borderRadius: '12px', fontSize: '14px' }}>
            {loading ? 'PROCESSANDO...' : <><Save size={20} /> SALVAR ALTERAÇÕES</>}
          </button>
        </div>
      </main>

      <style>{`
        .hover-upload:hover {
          border-color: #000 !important;
          background-color: #f8fafc !important;
          opacity: 0.8;
        }
        .btn-black {
          background: #000;
          color: #fff;
          border: none;
          font-weight: 800;
          letter-spacing: 1px;
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-black:hover {
          background: #333;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}