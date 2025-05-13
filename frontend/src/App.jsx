import { useState, useRef } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsWebcamActive(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Couldn't access the webcam. Please make sure it's connected and you've given permission to use it.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], "animal-drawing.jpg", { type: "image/jpeg" });
      setFile(file);
      stopWebcam();
    }, 'image/jpeg');
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please capture or upload a drawing first!");
      return;
    }
    const base64 = await toBase64(file);
    const res = await fetch('https://drawmyworld-api.onrender.com/api/upload', {
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
    <div className="app-container">
      <header className="hero-section">
        <h1>🎨 Draw My Zoo</h1>
        <p className="tagline">Draw your favorite animals and watch them come to life in our magical zoo!</p>
      </header>

      <section className="features">
        <div className="feature-card">
          <h2>🖌️ Draw & Color</h2>
          <p>Grab your crayons and draw your favorite animal! Make it colorful and fun!</p>
        </div>
        <div className="feature-card">
          <h2>📸 Take a Picture</h2>
          <p>Use your webcam to take a picture of your drawing. We'll make it come alive!</p>
        </div>
        <div className="feature-card">
          <h2>🦁 Watch it Move</h2>
          <p>See your animal come to life and join other animals in our virtual zoo!</p>
        </div>
      </section>

      <section className="upload-section">
        <h2>Let's Create Your Animal!</h2>
        <div className="upload-container">
          {!isWebcamActive ? (
            <>
              <button onClick={startWebcam} className="webcam-button">
                📸 Open Webcam
              </button>
              <p className="or-text">or</p>
              <input 
                type="file" 
                onChange={e => setFile(e.target.files[0])} 
                className="file-input"
                accept="image/*"
              />
            </>
          ) : (
            <div className="webcam-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="webcam-preview"
              />
              <div className="webcam-buttons">
                <button onClick={captureImage} className="capture-button">
                  📸 Take Picture
                </button>
                <button onClick={stopWebcam} className="cancel-button">
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}
          
          {file && (
            <div className="preview-container">
              <img 
                src={URL.createObjectURL(file)} 
                alt="Your drawing" 
                className="drawing-preview"
              />
              <button onClick={handleUpload} className="upload-button">
                🎪 Add to Zoo
              </button>
            </div>
          )}
          
          <button onClick={clearImages} className="clear-button">
            🧹 Clear Zoo
          </button>
        </div>
      </section>

      <section className="gallery">
        <h2>Your Virtual Zoo</h2>
        <div className="images-grid">
          {images.map(img => (
            <div key={img.id} className="image-container">
              <img
                src={img.src}
                alt="Your animal in the zoo"
                className="gallery-image"
              />
              <button 
                onClick={() => removeImage(img.id)}
                className="remove-button"
              >
                Remove Animal
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
