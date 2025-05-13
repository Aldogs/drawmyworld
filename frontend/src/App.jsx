import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup webcam on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      setError(null);
      console.log('Requesting webcam access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      console.log('Webcam access granted:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsWebcamActive(true);
      } else {
        console.error('Video element not found');
        setError('Video element not found');
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError(`Couldn't access the webcam: ${err.message}`);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      console.log('Stopping webcam...');
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.label);
      });
      videoRef.current.srcObject = null;
      streamRef.current = null;
      setIsWebcamActive(false);
    }
  };

  const captureImage = () => {
    try {
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], "animal-drawing.jpg", { type: "image/jpeg" });
          setFile(file);
          stopWebcam();
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Error capturing image:', err);
      setError(`Failed to capture image: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please capture or upload a drawing first!");
      return;
    }

    try {
      setError(null);
      console.log('Converting file to base64...');
      const base64 = await toBase64(file);
      console.log('Uploading to server...');
      
      const res = await fetch('https://drawmyworld-api.onrender.com/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64 }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Server response:', data);
      
      if (data.imageData) {
        setImages(prev => [...prev, { id: Date.now(), src: data.imageData }]);
        setFile(null); // Clear the file after successful upload
      } else {
        throw new Error('No image data in server response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload: ${err.message}`);
    }
  };

  const toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  const clearImages = () => {
    console.log('Clearing images...');
    setImages([]);
  };

  const removeImage = id => {
    console.log('Removing image:', id);
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="app-container">
      <header className="hero-section">
        <h1>🎨 Draw My Zoo</h1>
        <p className="tagline">Draw your favorite animals and watch them come to life in our magical zoo!</p>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

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
