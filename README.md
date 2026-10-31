# EpicNode Games

EpicNode Studio'ning HTML5 o'yinlar sayti (Yandex Games uslubida).

## Fayllar

| Fayl | Nima uchun |
|---|---|
| `index.html` | Bosh sahifa: o'yinlar katalogi, toifalar, qidiruv |
| `game.html` | O'yin sahifasi (`game.html?id=shahar-mushti`) |
| `about.html`, `privacy.html`, `terms.html`, `contact.html` | AdSense uchun kerakli sahifalar |
| `admin.html` | Yashirin boshqaruv paneli (faqat admin) |
| `admin-auth.json` | Admin parolining xeshi (parolning o'zi emas) |
| `games.json` | O'yinlar ro'yxati — admin panel shu faylni yangilaydi |
| `games/<id>/` | Har bir o'yinning fayllari va muqova rasmi |
| `assets/config.js` | **Sozlamalar: AdSense ID shu yerga yoziladi** |
| `ads.txt`, `robots.txt` | AdSense va qidiruv tizimlari uchun |

## 1. Saytni internetga chiqarish (GitHub Pages, bepul)

1. GitHub'da **`epicnode-games`** nomli yangi ombor (repository) oching. Bepul tarifda Pages uchun ombor **Public** bo'lishi kerak.
2. Shu papkadagi barcha fayllarni omborga yuklang ("Add file → Upload files", papkalari bilan birga).
3. Ombor → **Settings → Pages** → Source: *Deploy from a branch*, Branch: `main`, papka: `/ (root)` → Save.
4. 1–2 daqiqadan keyin sayt `https://janobotabek.github.io/epicnode-games/` manzilida ochiladi.

**Domen ulash:** domen sotib olgach, Settings → Pages → *Custom domain* ga domenni yozing va domen sotuvchisining DNS sozlamalarida GitHub ko'rsatgan yozuvlarni qo'shing. "Enforce HTTPS" ni yoqing.

## 2. Admin panel

Manzil: `sizning-saytingiz/admin.html` (saytda bu sahifaga havola yo'q).

Himoya ikki qavatli:

1. **Login va parol** — panelni ochadi. Parol saytda saqlanmaydi, faqat uning PBKDF2 xeshi (310 000 marta). 5 marta noto'g'ri kiritilsa, kirish vaqtincha bloklanadi.
2. **GitHub token** — o'yin qo'shish uchun haqiqiy ruxsat shu. Sayt statik bo'lgani uchun tokensiz hech kim (hatto panelni qandaydir yo'l bilan ochgan odam ham) saytni o'zgartira olmaydi.

**Token olish (bir marta):**
GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token →
- Repository access: *Only select repositories* → `epicnode-games`
- Permissions → Repository permissions → **Contents: Read and write**
- Muddatini (Expiration) 90 kun qilib qo'ying.

Tokenni hech kimga bermang va hech qayerga yozib qo'ymang. Panel uni faqat brauzer oynasi ochiq turguncha eslab qoladi.

**Panelda nima qilsa bo'ladi:** yangi o'yin qo'shish (bitta HTML yoki butun papka + muqova rasm + tavsif), o'yinni yashirish/ko'rsatish, bosh sahifadagi tanlangan o'yinni almashtirish, login va parolni o'zgartirish. O'yinni yashirish fayllarni o'chirmaydi.

## 3. Google AdSense

1. Sayt domen bilan ishga tushgach, adsense.google.com da ro'yxatdan o'ting va domeningizni kiriting.
2. Berilgan `ca-pub-...` ID ni `assets/config.js` dagi `adsenseClient` ga yozing.
3. `ads.txt` dagi qatorni o'z ID'ingiz bilan to'g'rilang va `#` ni olib tashlang.
4. Tasdiqlangandan keyin `config.js` da `adsenseTest: false` qiling.

O'yin sahifasida Google'ning **H5 Games Ads** (Ad Placement API) ulangan: reklama "O'ynash" bosilganda va "Qayta yuklash"da, o'yin oralig'ida chiqadi. Reklama bo'lmasa ham o'yin baribir boshlanadi.

## Mahalliy tekshirish

`games.json` `fetch` orqali o'qiladi, shuning uchun `index.html` ni ikki marta bosib ochsangiz katalog bo'sh ko'rinadi. Kompyuterda tekshirish uchun papkada:

```
python -m http.server 8000
```

keyin brauzerda `http://localhost:8000` ni oching.
