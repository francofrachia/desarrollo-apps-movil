const BACKEND_URL = 'http://10.0.2.2:3000';

export const testDownload = async (sizeMB = 5) => {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BACKEND_URL}/download?size=${sizeMB}`, {
      cache: 'no-store'
    });
    const blob = await response.blob();
    const durationSec = (Date.now() - startTime) / 1000;
    
    if (durationSec === 0) return 0;
    const bitsLoaded = blob.size * 8;
    const mbps = (bitsLoaded / 1024 / 1024) / durationSec;
    return mbps;
  } catch (e) {
    console.log('Download error:', e);
    return 0;
  }
};

export const testUpload = async (sizeMB = 1) => {
  try {
    const payloadSize = sizeMB * 1024 * 1024;
    // Creamos un payload dummy
    const body = '0'.repeat(payloadSize);
    
    const startTime = Date.now();
    await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body
    });
    
    const durationSec = (Date.now() - startTime) / 1000;
    if (durationSec === 0) return 0;
    const bitsLoaded = payloadSize * 8;
    const mbps = (bitsLoaded / 1024 / 1024) / durationSec;
    return mbps;
  } catch (e) {
    console.log('Upload error:', e);
    return 0;
  }
};
