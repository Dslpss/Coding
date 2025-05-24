const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyATDE21wBLKPqLcAXKzIQti9vvYAT3gZPM",
  authDomain: "barbearia-bd25e.firebaseapp.com",
  projectId: "barbearia-bd25e",
  storageBucket: "barbearia-bd25e.appspot.com",
  messagingSenderId: "1079641275104",
  appId: "1:1079641275104:web:e166f6912943c96bee6e85",
  measurementId: "G-0MM4VLLQJR",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "blog"));
    console.log("Posts encontrados:");
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("ID:", doc.id);
      console.log("Title:", data.title);
      console.log("Slug:", data.slug);
      console.log("Summary:", data.summary);
      console.log("---");
    });
  } catch (error) {
    console.error("Erro:", error);
  }
}

listPosts();
