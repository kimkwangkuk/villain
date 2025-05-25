const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth } = require('firebase/auth');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAdmo8SKrrkDocCXGIE_eOo4QxWMxA0is8",
    authDomain: "villain-5f05a.firebaseapp.com",
    projectId: "villain-5f05a",
    storageBucket: "villain-5f05a.firebasestorage.app",
    messagingSenderId: "579679958637",
    appId: "1:579679958637:web:38705cebd28d47fc803164",
    measurementId: "G-0MLWMN815Q"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const storage = getStorage();
const auth = getAuth(app);

// 이미지 최적화 함수
async function optimizeImage(inputBuffer) {
  return sharp(inputBuffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center'
    })
    .webp({
      quality: 80,
      effort: 6
    })
    .toBuffer();
}

// 이미지 업로드 함수
async function uploadImage(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const optimizedBuffer = await optimizeImage(fileBuffer);
    
    const fileName = path.basename(filePath);
    const newFileName = `profile_images/${path.parse(fileName).name}.webp`;
    console.log('Upload path:', newFileName);
    
    const storageRef = ref(storage, newFileName);
    
    const uploadResult = await uploadBytes(storageRef, optimizedBuffer, {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000',
    });

    const publicUrl = await getDownloadURL(uploadResult.ref);
    console.log(`Successfully uploaded: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// 디렉토리의 모든 이미지 업로드
async function uploadAllImages() {
  try {
    const imageDir = path.join(__dirname, '../images');
    console.log('Looking for images in:', imageDir);

    const files = await fs.readdir(imageDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images to upload:`, imageFiles);

    for (const file of imageFiles) {
      const filePath = path.join(imageDir, file);
      console.log(`Uploading ${file}...`);
      await uploadImage(filePath);
    }

    console.log('All images uploaded successfully');
  } catch (error) {
    console.error('Error in batch upload:', error);
  } finally {
    process.exit();
  }
}

// 스크립트 실행
uploadAllImages();