
document.addEventListener('DOMContentLoaded', function() {
    const checkBtn = document.getElementById('checkBtn');
    const statusDiv = document.getElementById('status');
    const trackBtn = document.getElementById('trackBtn');
    const ebaySection = document.getElementById('ebaySection');
    const ebayPriceSpan = document.getElementById('ebayPrice');
    const usdPriceSpan = document.getElementById('usdPrice');
    
    // نئے ایلیمنٹس
    const verifyBtn = document.getElementById('verifyBtn');
    const licenseKeyInput = document.getElementById('licenseKey');

    // --- 1. INITIAL STATUS CHECK ---
    function updateUIStatus() {
        chrome.storage.local.get(['isPremium', 'expiryDate', 'usageCount'], (data) => {
            let today = new Date().getTime();
            if (data.isPremium && data.expiryDate && today > data.expiryDate) {
                chrome.storage.local.set({ isPremium: false, usageCount: 3 });
            }
            // اگر پریمیئم ہے تو بیچ دکھا دو
            if (data.isPremium) {
                document.getElementById('badge').style.display = 'block';
            }
        });
    }

    updateUIStatus();

    // --- 2. VERIFY LICENSE KEY (نئی لاجک) ---
    verifyBtn.addEventListener('click', () => {
        let key = licenseKeyInput.value.trim();
        const validKeys = ["PRO-KEY-99", "EBAY-WIN-01", "MARIAM2026"]; 

        if (validKeys.includes(key)) {
            let thirtyDays = 30 * 24 * 60 * 60 * 1000;
            let expiry = new Date().getTime() + thirtyDays;

            chrome.storage.local.set({ isPremium: true, expiryDate: expiry }, () => {
                alert("✅ Pro Activated for 1 Month!");
                location.reload();
            });
        } else {
            alert("❌ Invalid Key!");
        }
    });

    checkBtn.addEventListener('click', async () => {
        chrome.storage.local.get({ usageCount: 0, isPremium: false, expiryDate: 0 }, async (data) => {
            let today = new Date().getTime();

            // Expire check
            if (data.isPremium && data.expiryDate && today > data.expiryDate) {
                chrome.storage.local.set({ isPremium: false });
                alert("Subscription expired!");
                return;
            }

            if (data.isPremium) {
                runScraper(true, data.usageCount);
            } else if (data.usageCount < 3) {
                runScraper(false, data.usageCount);
            } else {
                alert("Limit reached! Please activate Pro.");
            }
        });
    });

    function runScraper(isPremium, count) {
        statusDiv.innerText = "Extracting Pro Data...";
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    let p = document.querySelector('.a-price .a-offscreen')?.innerText || "0";
                    let s = document.querySelector('#availability span')?.innerText.trim() || "In Stock";
                    let t = document.querySelector('#productTitle')?.innerText.trim() || "Product";
                    let img = document.querySelector('#landingImage')?.src || "";
                    return { price: p, stock: s, title: t, url: window.location.href, image: img };
                }
            }, (results) => {
                if (results && results[0].result) {
                    const res = results[0].result;
                    let suggestedPrice = (parseFloat(res.price.replace(/[^\d.]/g, '')) * 1.2 + 2).toFixed(2);

                    statusDiv.innerHTML = `<b>Price:</b> ${res.price}<br><b>Stock:</b> ${res.stock}`;
                    ebayPriceSpan.innerText = `$${suggestedPrice}`;
                    usdPriceSpan.innerText = `${res.price}`;
                    
                    ebaySection.style.display = 'block';
                    trackBtn.style.display = 'block';

                    if (!isPremium) {
                        chrome.storage.local.set({ usageCount: count + 1 });
                    }
                    setupButtons(res, suggestedPrice);
                }
            });
        });
    }

    function setupButtons(res, ebayPrice) {
        document.getElementById('zikAnalysis').onclick = () => chrome.tabs.create({ url: `https://www.zikanalytics.com/Search/ProductResearch?keywords=${encodeURIComponent(res.title)}` });
        document.getElementById('searchEbay').onclick = () => chrome.tabs.create({ url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(res.title)}` });
        trackBtn.onclick = () => alert("Product Tracked!");
    }
});