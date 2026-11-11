'use client';
import { useState } from 'react';

export default function CrawlArticlePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCrawl = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crawl-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Có lỗi xảy ra!');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>MASTER English - Máy Đọc Báo Tự Động</h1>
      <input 
        type="text" 
        placeholder="Dán đường link BBC, CNN vào đây..." 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '15px', fontSize: '16px' }}
      />
      <button 
        onClick={handleCrawl} 
        disabled={loading}
        style={{ padding: '10px 20px', background: '#000', color: '#fff', fontSize: '16px', cursor: 'pointer' }}
      >
        {loading ? 'Hệ thống đang cào và phân tích...' : 'Xử lý bài báo'}
      </button>

      {result && (
        <pre style={{ background: '#f4f4f4', padding: '20px', marginTop: '20px', overflowX: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
