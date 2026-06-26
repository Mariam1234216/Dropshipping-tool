
// Amazon Price nikalne ka logic
function getAmazonPrice() {
    const priceSelectors = [
        ".a-price .a-offscreen",
        "#corePrice_feature_div .a-offscreen",
        "#priceblock_ourprice",
        ".apexPriceToPay .a-offscreen"
    ];
    for (let selector of priceSelectors) {
        let element = document.querySelector(selector);
        if (element && element.innerText.trim() !== "") return element.innerText.trim();
    }
    return "Price not found";
}

// Stock status check karne ka behtar tareeqa
function getAmazonStock() {
    let availElement = document.querySelector("#availability span");
    let stockText = availElement ? availElement.innerText.trim() : "";
    
    // Agar text mein 'unavailable' ya 'out of stock' ho
    const outOfStockSigns = ["unavailable", "out of stock", "temporarily out of stock"];
    let isOut = outOfStockSigns.some(sign => stockText.toLowerCase().includes(sign));

    // Fallback: Agar text nahi mila to check karein 'Add to Cart' button hai ya nahi
    let addBtn = document.querySelector("#add-to-cart-button");
    
    if (isOut || !addBtn) {
        return "⚠️ OUT OF STOCK";
    }
    return "✅ In Stock";
}

// Message receive karna Popup se
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeAmazon") {
        sendResponse({ 
            price: getAmazonPrice(), 
            stock: getAmazonStock(), 
            title: document.querySelector("#productTitle")?.innerText.trim() || "Product Not Found", 
            url: window.location.href 
        });
    }
    return true; 
});