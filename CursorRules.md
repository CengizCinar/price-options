# Price Comparison Extension Rules

## 1. EAN İşleme Kuralları
- Keepa API'den gelen tüm EAN'ler değerli olabilir
- EAN'leri sırayla dene, ilk çalışanda dur
- Her site için ayrı EAN takibi yap
- Çalışan EAN'i link ve gösterim için sakla
- EAN bulunamazsa "EAN not found" göster

## 2. Fiyat İşleme Kuralları
- Her zaman en düşük fiyatı göster
- Para birimi formatını koru (€ için virgül, kr için tam sayı)
- Fiyat bulunamazsa o siteyi gösterme
- Regex pattern'larını değiştirme (kritik bileşen)
- Her site için doğru para birimi formatını kullan

## 3. URL ve Request Kuralları
- Base URL'leri değiştirme (kritik bileşen)
- Her site için doğru dil header'larını kullan
- Fetch konfigürasyonlarını değiştirme (kritik bileşen)
- CORS ve güvenlik politikalarına uy
- URL parametrelerini encode et

## 4. Performans Kuralları
- Promise.all ile paralel request'ler yap
- Her site kendi içinde senkron çalışsın
- Gereksiz DOM parse'dan kaçın
- Console.log'ları production'da kaldır
- Memory leak'lerden kaçın

## 5. UI Kuralları
- Fiyatları tutarlı formatta göster
- Site isimlerini standart göster
- Tıklanabilir alanları belirgin yap
- Loading state'leri göster
- Hata mesajlarını kullanıcı dostu yap

## 6. Yeni Site Ekleme Kuralları
- Önce HTML yapısını analiz et
- Fiyat elementinin stabilitesini kontrol et
- Test EAN'leri ile doğrula
- Doğru header'ları belirle
- Para birimi formatını standartlaştır

## 7. Hata Yönetimi
- Her request için timeout belirle
- Network hatalarını yakala
- Parse hatalarını sessizce handle et
- Kullanıcıya anlamlı mesajlar göster
- Hataları loglama yap

## 8. Güvenlik Kuralları
- API key'leri güvenli sakla
- User-Agent'ları gerçekçi kullan
- Rate limiting uygula
- Sensitive dataları maskeleme
- Cross-site scripting'den kaçın

## 9. Test Kuralları
- Her yeni site için test case'ler yaz
- Edge case'leri kontrol et
- Farklı EAN formatlarını test et
- Network hatalarını simüle et
- UI'ı farklı boyutlarda test et

## 10. Bakım Kuralları
- Kod modülerliğini koru
- Değişiklikleri document et
- Version control kullan
- Breaking change'leri belirt
- Performans metriklerini takip et

## 11. Gelecek Geliştirmeler İçin Notlar
- Fiyat geçmişi özelliği eklenebilir
- Stok durumu eklenebilir
- Fiyat alarmları eklenebilir
- Daha fazla site eklenebilir
- Kullanıcı tercihleri eklenebilir

## ÖNEMLİ: Değiştirilmemesi Gereken Kritik Bileşenler
- URL yapıları
- Fetch konfigürasyonları
- Temel izinler
- Fiyat parse etme mantığı
- Manifest.json temel yapısı 