import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);

  const handleUpload = async () => {
    const base64 = await toBase64(file);
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData: base64 }),
    });
    const data = await res.json();
    setImages(prev => [...prev, { id: Date.now(), src: data.imageData }]);
  };

  const toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  const clearImages = () => setImages([]);

  const removeImage = id => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div>
      <h1>Draw My World</h1>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Drawing</button>
      <button onClick={clearImages}>Clear World</button>
      <div>
        {images.map(img => (
          <img
            key={img.id}
            src={img.src}
            onClick={() => removeImage(img.id)}
            style={{ width: 100, margin: 10, cursor: 'pointer' }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
