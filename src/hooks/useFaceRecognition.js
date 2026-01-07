/** @format */
import Human from '@vladmandic/human';

let human = null;
let stream = null;

// Init & load Human models
export const loadModels = async () => {
  if (!human) {
    human = new Human({
      backend: 'webgl',
      modelBasePath: '/models/human/',
      cacheModels: true,
      face: {
        detector: { enabled: true, maxDetected: 1 },
        description: { enabled: true },
        mesh: { enabled: false },
        iris: { enabled: false },
        emotion: { enabled: false },
      },
      body: { enabled: false },
      hand: { enabled: false },
      gesture: { enabled: false },
      object: { enabled: false },
    });

    await human.load();
    await human.warmup();
  }
  return human;
};

// Start Camera
export const startCamera = async (videoRef, streamRef) => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
      audio: false,
    });

    stream = mediaStream;
    streamRef.current = mediaStream;
    videoRef.current.srcObject = mediaStream;

    await new Promise((resolve) => {
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        resolve();
      };
    });

  } catch (error) {
    throw new Error(error);
  }
};

// Stop Camera
export const stopCamera = (streamRef, videoRef) => {
  if (streamRef?.current) {
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }
  if (videoRef?.current) {
    videoRef.current.srcObject = null;
  }
  stream = null;
};

// Wait until video has rendered frames
const waitForFrames = async (video, count = 3) => {
  for (let i = 0; i < count; i++) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      i--;
    }
  }
};

// Detect + generate descriptor
export const detectFaceDescriptor = async (videoRef) => {
  if (!human) await loadModels();
  if (!videoRef?.current) return null;

  const video = videoRef.current;

  // Ensure video has real frames
  await waitForFrames(video, 3);

  // Warm-up once (discard result)
  await human.detect(video);

  // Actual detection
  const result = await human.detect(video);
  if (result.face?.length > 0) {
    return Array.from(result.face[0].embedding);
  }
  return null;
};

// Capture still frame
export const captureImageFromVideo = async (videoRef) => {
  if (!videoRef?.current) return null;

  const video = videoRef.current;
  await waitForFrames(video, 3);

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
};

// Cleanup
export const cleanup = () => {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  human = null;
};
