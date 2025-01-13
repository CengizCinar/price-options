// background.js
const idealoUrl = 'https://www.idealo.de/preisvergleich/MainSearchProductCategory.html';
// Critical component - DO NOT MODIFY
const priceRegex = /<div[^>]*class="sr-detailedPriceInfo__price_sYVmx"[^>]*>[^€]*?(\d+,\d{2})\s*€/g;

// Prisjakt konfigürasyonu ekleyelim
const prisjaktUrl = 'https://www.prisjakt.nu/search';
const prisjaktPriceRegex = /<span class="Text--q06h0j igDZdP"[^>]*>(\d+)\s*kr<\/span>/;

// Pricerunner fiyat çekme fonksiyonu
const pricerunnerUrl = 'https://www.pricerunner.se/results';

// Fiyatları işleyip en düşüğünü bulan yardımcı fonksiyon
function getLowestPrice(priceStr) {
  if (!priceStr) return null;
  const prices = priceStr.match(/\d+(?:,\d+)?/g)
    ?.map(price => parseFloat(price.replace(',', '.'))) || [];
  if (prices.length === 0) return null;
  const lowestPrice = Math.min(...prices);
  const currency = priceStr.includes('€') ? '€' : 'kr';
  return currency === '€' 
    ? `${lowestPrice.toFixed(2).replace('.', ',')} €`
    : `${Math.round(lowestPrice)} kr`;
}

// Her site için ayrı fiyat çekme fonksiyonları
async function fetchIdealoPrice(ean) {
  try {
    const url = `${idealoUrl}?q=${ean}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    const matches = html.match(priceRegex);
    if (!matches) return null;

    const allPrices = matches.map(match => {
      const price = match.match(/(\d+,\d{2})\s*€/)[1];
      return getLowestPrice(price + ' €');
    });

    return allPrices.length > 0 ? allPrices[0] : null;
  } catch (error) {
    console.error('Idealo fetch error:', error);
    return null;
  }
}

async function tryFetchPriceWithEANs(eanList, fetchPriceFunction) {
  for (const ean of eanList) {
    try {
      console.log(`Trying EAN: ${ean}`);
      const price = await fetchPriceFunction(ean);
      if (price) {
        console.log(`Success with EAN ${ean}: ${price}`);
        return { price, successfulEan: ean };
      }
    } catch (error) {
      console.log(`Failed with EAN ${ean}, trying next...`);
      continue;
    }
  }
  return { price: null, successfulEan: null };
}

const fetchEANFromKeepa = async (asin) => {
  const apiKey = "5o0nilgatkp122piremv5al71scg35ad18bil3c9fo7kluf35pcdktnruck315f6";
  const keepaApiUrl = "https://api.keepa.com/product";

  try {
    const response = await fetch(`${keepaApiUrl}?key=${apiKey}&domain=1&asin=${asin}`);
    const data = await response.json();

    if (response.ok && data.products?.[0]?.eanList?.length > 0) {
      const eanList = data.products[0].eanList;
      console.log(`ASIN: ${asin}, Found EANs:`, eanList);
      return eanList; // Tüm EAN listesini döndür
    }
    
    console.log(`ASIN: ${asin}, EAN not found`);
    return "EAN not found";
  } catch (error) {
    console.error("Keepa API Error:", error);
    return null;
  }
};

// Prisjakt fiyat çekme fonksiyonu
async function fetchPrisjaktPrice(searchQuery) {
  try {
    const url = `${prisjaktUrl}?search=${searchQuery}`;
    console.log('Fetching Prisjakt URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const match = prisjaktPriceRegex.exec(html);
    
    if (match && match[1]) {
      return match[1] + ' kr';
    }
    
    throw new Error('No Prisjakt price found');
    
  } catch (error) {
    console.error('Prisjakt fetch error:', error);
    return null;
  }
}

// Pricerunner fiyat çekme fonksiyonu
async function fetchPricerunnerPrice(searchQuery) {
  try {
    const url = `${pricerunnerUrl}?q=${searchQuery}`;
    console.log('Fetching Pricerunner URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Daha genel bir metin bazlı arama yapalım
    const priceMatch = html.match(/class="pr-1t1srqo"[^>]*>(\d+)(?:&nbsp;|\s*)kr/);
    if (priceMatch && priceMatch[1]) {
      return `${priceMatch[1]} kr`;
    }
    
    throw new Error('No Pricerunner price found');
    
  } catch (error) {
    console.error('Pricerunner fetch error:', error);
    return null;
  }
}

// Exchange API sabitleri
const EXCHANGE_API_KEY = '2e421925bd6de33a25bf667b';
const EXCHANGE_API_URL = 'https://v6.exchangerate-api.com/v6/2e421925bd6de33a25bf667b/latest/EUR';

async function fetchExchangeRates() {
  try {
    const response = await fetch(EXCHANGE_API_URL);
    const data = await response.json();
    console.log('Exchange rates fetched:', data);
    return data.conversion_rates;  // Direkt conversion_rates'i döndür
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return { EUR: 1, SEK: 11.4896 }; // Fallback değerler
  }
}

// Message listener'ı güncelleyelim
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchPrices") {
    // Promise chain'i düzgün yönetelim
    (async () => {
      try {
        console.log('Fetching started for ASIN:', request.asin);
        
        // Tüm async işlemleri bir Promise.all içinde yapalım
        const [eanList, rates] = await Promise.all([
          fetchEANFromKeepa(request.asin),
          fetchExchangeRates()
        ]);

        console.log('EAN List:', eanList);
        console.log('Exchange Rates:', rates);

        if (!eanList || !Array.isArray(eanList)) {
          sendResponse({ success: false, error: 'No valid EAN found' });
          return;
        }

        // Tüm fiyat çekme işlemlerini paralel yapalım
        const [idealoResult, prisjaktResult, pricerunnerResult] = await Promise.all([
          tryFetchPriceWithEANs(eanList, fetchIdealoPrice),
          tryFetchPriceWithEANs(eanList, fetchPrisjaktPrice),
          tryFetchPriceWithEANs(eanList, fetchPricerunnerPrice)
        ]);

        const prices = [];

        // Fiyatları ekle ve normalize et
        if (idealoResult.price) {
          prices.push({
            site: 'idealo.de',
            originalPrice: idealoResult.price,
            ean: idealoResult.successfulEan,
            priceInEUR: parseFloat(idealoResult.price.replace(',', '.'))
          });
        }

        if (prisjaktResult.price) {
          const sekPrice = parseFloat(prisjaktResult.price.replace(' kr', ''));
          prices.push({
            site: 'prisjakt.nu',
            originalPrice: prisjaktResult.price,
            ean: prisjaktResult.successfulEan,
            priceInEUR: sekPrice / rates.SEK
          });
        }

        if (pricerunnerResult.price) {
          const sekPrice = parseFloat(pricerunnerResult.price.replace(' kr', ''));
          prices.push({
            site: 'pricerunner.se',
            originalPrice: pricerunnerResult.price,
            ean: pricerunnerResult.successfulEan,
            priceInEUR: sekPrice / rates.SEK
          });
        }

        // Fiyatları sırala
        const sortedPrices = prices.sort((a, b) => a.priceInEUR - b.priceInEUR);

        console.log('Sending sorted prices:', sortedPrices);
        
        // Hemen yanıt ver
        sendResponse({
          success: true,
          prices: sortedPrices,
          allEans: eanList
        });

      } catch (error) {
        console.error('Error in price fetch:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      }
    })().catch(error => {
      console.error('Critical error:', error);
      sendResponse({
        success: false,
        error: 'Critical error occurred'
      });
    });

    return true; // Async işlem için gerekli
  }
});