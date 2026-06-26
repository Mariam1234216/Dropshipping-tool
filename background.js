
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- YAHAN APNI KEYS PASTE KARNEIN ---
const firebaseConfig = {
  apiKey: "AIzaSyBC2feNLAoF6tqF4eFLThZrwJehbxKK8m8",
  authDomain: "smartdropshippro.firebaseapp.com",
  projectId: "smartdropshippro",
  storageBucket: "smartdropshippro.firebasestorage.app",
  messagingSenderId: "878265684292",
  appId: "1:878265684292:web:7b5542c4fbaa8dbb5ec711"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Har 1 minute baad check karne ke liye alarm
chrome.alarms.create("stockMonitor", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "stockMonitor") {
        checkAllStoredProducts();
    }
});

async function checkAllStoredProducts() {
    chrome.storage.local.get(null, async (items) => {
        // Sirf tab chalao agar user premium ho
        if (!items.isPremium) return; 

        for (let url in items) {
            if (!url.startsWith("http") || !url.includes("amazon.com")) continue;

            try {
                const response = await fetch(url);
                const html = await response.text();

                // Amazon se price nikalne ka logic
                const priceMatch = html.match(/"priceAmount":([0-9.]+)/);
                let currentPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

                if (currentPrice) {
                    // Firebase Firestore mein update karna
                    // Hum document ID ki jagah 'product_asin' use karenge jo aap `items` se utha sakti hain
                    const docId = "product_" + Math.random().toString(36).substr(2, 9); 
                    await setDoc(doc(db, "products", docId), {
                        url: url,
                        price: currentPrice,
                        timestamp: new Date().toISOString()
                    }, { merge: true });
                }

                // Stock check
                if (html.includes("outOfStock") || html.includes("Currently unavailable")) {
                    sendAlert("Amazon Product", "⚠️ OUT OF STOCK!");
                }
            } catch (e) {
                console.error("Tracking Error:", e);
            }
        }
    });
}

function sendAlert(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: title,
        message: message,
        priority: 2
    });
}