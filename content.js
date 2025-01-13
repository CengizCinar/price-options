// content.js
const asinRegex = /\/dp\/([A-Z0-9]{10})/;

function createPriceContainer() {
  const container = document.createElement('div');
  container.style.padding = '15px';
  container.style.margin = '15px 0';
  container.style.backgroundColor = '#fff';
  container.style.border = '2px solid #ffd700';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  container.style.fontSize = '16px';
  container.style.lineHeight = '1.4';
  return container;
}

function displayPrices(container, data) {
  const { prices, allEans, exchangeRates } = data;

  container.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
      <div style="font-weight: 600; text-align: center; margin-bottom: 15px; font-size: 18px;">
        PRICE OPTIONS
      </div>

      ${prices.map(price => `
        <a href="${getUrlForSite(price.site, price.ean || allEans[0])}" target="_blank" style="text-decoration: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <span style="color: #2c3e50; font-size: 17px; font-weight: 600;">${price.site}</span>
            <span style="color: #00796b; font-weight: 600; font-size: 16px;">
              ${price.originalPrice} 
              <span style="font-size: 14px; color: #666;">
                (≈ ${price.priceInEUR.toFixed(2)} €)
              </span>
            </span>
          </div>
        </a>
      `).join('')}
      
      ${allEans ? `
        <div style="font-size: 12px; color: #666; text-align: right; margin-top: 5px;">
          EAN: ${prices[0]?.ean || allEans[0]}
        </div>
      ` : ''}
    </div>
  `;
}

function getUrlForSite(site, ean) {
  const urls = {
    'idealo.de': `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${ean}`,
    'prisjakt.nu': `https://www.prisjakt.nu/search?search=${ean}`,
    'pricerunner.se': `https://www.pricerunner.se/results?q=${ean}`
  };
  return urls[site] || '#';
}

function init() {
  const match = window.location.pathname.match(asinRegex);
  
  if (match && match[1]) {
    const asin = match[1];
    console.log('ASIN:', asin);
    
    const priceContainer = createPriceContainer();
    priceContainer.innerHTML = 'Checking prices...';
    
    const offerDisplayGroup = document.getElementById('offerDisplayGroup') || 
                            document.getElementById('buyBox') ||
                            document.querySelector('.a-box-group');
                            
    if (offerDisplayGroup) {
      offerDisplayGroup.parentNode.insertBefore(priceContainer, offerDisplayGroup);
      
      chrome.runtime.sendMessage(
        { action: 'fetchPrices', asin: asin },
        response => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            priceContainer.innerHTML = 'Error fetching prices.';
            return;
          }
          console.log('Received response:', response);
          displayPrices(priceContainer, response);
        }
      );
    }
  }
}

init();