# why.zero.university — sahnama-sahna hikoya tahlili

Sayt: https://why.zero.university/ — "Zero" (ishga joylashishga tayyorlovchi platforma) uchun hikoyali landing.
Tahlil sanasi: 2026-09-23. Usul: brauzerda to'liq o'tish + canvas'ni MediaRecorder bilan videoga yozib, kadrma-kadr (0.05–0.4 s qadam) ko'rish. Batafsil usul: `../analysis-method.md`.

> Vaqtlar (masalan "1.8 s") — o'sha yozuv ichidagi nisbiy vaqt, saytning absolyut vaqti emas. Ular o'tishlarning **davomiyligi va ritmini** ko'rsatadi.

---

## Umumiy dramaturgiya

```
1. O'yin bilan kirish   → foydalanuvchini qatnashtirish (nol chizish, XP)
2. Orzu                 → yorug', yashil, jannat ("College would land you a JOB")
3. Burilish             → TAP HOLD → o'rta barmoq → zulmat → "Bullsh*t"
4. Dalillar             → qizil, singan shishadagi statistika
5. Sabab                → pul, yonayotgan diplomlar ("University sells paper")
6. Muammo               → "see the Disconnect"
7. Yechimga o'tish      → TAP HOLD → siqilish → portlash → oq nur
8. Yechim               → bulutlar, "Introducing zero"
9. Va'da                → "Real projects / tools / skills"
10. Harakatga chaqiruv  → interaktiv shahar, har bir bino = loyiha → "Join Beta"
```

**Asosiy sirlar:**
- Har bir bob o'z **rangiga** ega (yashil-oq → qizil → to'q yashil → qora → oq).
- Ikki **TAP HOLD** — bir-birining ko'zgusi: birinchisi jannatdan zulmatga tushiradi, ikkinchisi zulmatdan nurga olib chiqadi.
- Butun sayt bitta **metafora** atrofida: **qo'l** (muzdan chiqqan qo'l → Mikelanjelo qo'llari → o'rta barmoq → zulmatni sindirgan qo'l → Franklin portretiga aylangan qo'l).
- Foydalanuvchi **tomoshabin emas, ishtirokchi**: chizadi, bosib turadi, XP yig'adi.
- Tipografiya: nafis **kursiv (script)** + klassik **serif** aralash, bitta so'zning bosh harfi katta kursiv ("*C*ollege", "*J*ob", "*W*hy", "*E*xist", "*R*eal").
- UI doimiy: yuqorida progress chizg'ichi ("-100 BZ … 0 BZ"), o'ng yuqorida XP hisoblagichi, pastda "Join Beta" tugmasi, chap yuqorida menyu.

---

## 0. Loader
- Yashil gradient fon, chap pastda katta foiz raqami (0 → 99). "99" da 15–20 s turib qolishi mumkin (og'ir assetlar).
- Raqamlar vertikal "baraban" (0–9 ustunlari) sifatida aylanadi.

## 1. Kirish — "DRAW A ZERO"
- Muz/suv yuzasi teksturasi (frost + normal map), muz ostida **yashil, matcap-materialli 3D qo'l** — ko'rsatkich barmoq yuqoriga.
- O'rtada yarim chizilgan oq halqa va "DRAW A ZERO" yozuvi; chap pastda "ZERO" logotipi (muz kabi).
- Foydalanuvchi sichqoncha bilan **doira chizadi** → barmoq muzni teshadi: nurli, yirtiq qirrali teshik (oq glow) ochiladi → ekran **oqqa** to'ladi → oltin **yulduz ikonka + "+100 XP"** chiqadi.
- O'rta chizilgan doira = "zero" (brend nomi). Birinchi soniyadayoq brend + interaktivlik.

## 2. Orzu — "You Believed / College would land You a JOB"
- Oq-yashil yorug' fon, markazda nur (radial glow).
- **"You Believed"** (katta script+serif).
- Scroll → yashil 3D qo'l yuqoriga intiladi; atrofida **tangalar** aylanadi — ustida kompaniya logotiplari (IBM, Apple, Microsoft, Google, Meta, Nike…) = "orzudagi ish joylari".
- "**C**ollege / would" chap yuqorida, "land / **Y**ou" o'ng pastda — matn diagonal kompozitsiyada, qo'l o'rtada.
- Qo'l burilib, gorizontal holatga keladi (keyingi sahnaga tayyorgarlik).

## 3. Jannat — "a JOB"
- Fon: **antik ustunlar, gulli o'tloq, ko'l, bulutlar, quyosh nurlari (god rays)**, uchib yurgan **pushti gul barglari** (3D).
- Chapdan yashil qo'l, o'ngdan **haqiqiy inson qo'li** — **Mikelanjeloning "Odam Atoning yaratilishi"** kompozitsiyasi.
- Markazda "a **JOB**" (katta serif).
- Scroll bilan qo'llar bir-biriga yaqinlashadi, "JOB" yozuvi yo'qoladi.

## 4. Birinchi TAP HOLD — burilish nuqtasi ⭐
Qo'llar orasida oq halqa + "TAP / HOLD" yozuvi (HTML). Bosib turish kerak (~4–6 s), halqa asta to'ladi, inson qo'li sekin yaqinlashadi.

Kadrma-kadr (bosish tugagan paytdan boshlab):

| Vaqt | Nima bo'ladi |
|---|---|
| 1.0–1.4 s | Qo'llar deyarli tegadi, gul barglari aylanadi |
| 1.6 s | Inson qo'li yetib keladi |
| 1.7 s | Yashil qo'l **mushtga** aylanadi; kadr **qorong'i/kontrastli** (glitch) |
| 1.8 s | Yashil qo'l **o'rta barmoq** ko'rsatadi; rang oddiy |
| 1.9 s | O'rta barmoq, kadr yana **qorong'i** — oddiy/qorong'i kadrlar almashib miltillaydi (**glitch/strobe**) |
| 2.0–2.3 s | Jannat manzarasi **qizil-qora tusga cho'kadi** (color grade), quyosh nurlari qoladi |
| 2.4–2.6 s | Hammasi **zulmatga** botadi, faqat qo'l silueti |
| 2.8–3.2 s | Qizil nur izlari yuqori burchakda so'nadi |
| 3.4–3.8 s | **To'liq qora ekran** (pauza — tomoshabin nafasini ushlaydi) |
| 4.0 s | Qora fondan **inson qo'li** chiqadi, barmoq uchlari qizil yorug'likda |
| 4.2–4.6 s | Qo'l **zulmatni shishadek sindiradi** — qora parchalar uchib ketadi, orqasidan **qizil sahna** (qizil parda + vertikal nur chiziqlari) ochiladi |
| 4.8–5.6 s | Qo'l ochilib yuqoriga cho'ziladi, "**But.**" yozuvi |
| 5.8–6.6 s | "But." yo'qoladi, qo'l qizil nur fonida |
| 6.8 s | "That's" (kichik script) + "**Bullsh\*t**" (katta serif, oq, glow) paydo bo'ladi, fonda **film donachasi (grain)** |
| 7.0 s+ | Yakuniy holat, XP 200 ga oshadi |

**2-yozuvdan (haqiqiy sichqoncha bilan) aniqlik:** o'tish bosilgandan ~1.2 s keyin boshlanadi (`frames/sheets/hold1-transition_*.jpg`): 21.07 s yashil qo'l burila boshlaydi → 21.27 s o'rta barmoq → 21.67–22.07 s qizil cho'kish → 22.27–23.27 s deyarli to'liq qora → 23.47 s qora fondan qo'l chiqadi (qizil parchalar) → 23.67–24.07 s zulmat qora parchalarga bo'linib uchadi, qizil sahna ochiladi → 24.27 s "But.".

**G'oya:** "Universitet senga ish beradi" degan va'da — xudoning qo'lidek — oxirgi soniyada o'rta barmoq ko'rsatadi. Kulgili + shok + g'azab.

## 5. Dalillar — qizil statistika
- Qizil fon (parda + vertikal nur chiziqlari), markazda inson qo'li (ochiq kaft, turli pozalar).
- Statistikalar **singan shisha parchalari** ustida (transmission/refraction, kamalak ranglari chetlarda), qo'l atrofida uchib o'tadi:
  - "73% who land in the wrong first job are still stuck 10 years later"
  - "25% of jobless americans have a degree"
  - "70% grads aren't working in their field"
  - "43% don't have a full time job 6 months after graduating"
  - "50% drop in grad hiring at BIG tech"
  - "Worst since 1988 — the hardest it's been to land a first job in 37 years"
- Bo'lim **tsikl** bo'lib aylanadi (qaytadan boshlanadi) — qachon tugashi foydalanuvchiga noaniq (UX kamchilik).

## 6. Qo'ldan dollarga o'tish ⭐ (~4 s)

| Vaqt | Nima bo'ladi |
|---|---|
| 62.0–62.8 | Qizil sahna, qo'l ikki barmoq ko'rsatadi, shisha parchalari |
| 63.2–64.4 | **Desaturatsiya**: qizil → jigarrang/sepiya, qo'l oq-qora **gravyura** ko'rinishiga o'tadi |
| 64.7 | **Hard cut**: qo'l birdan 100$ banknotaning **yashil ovali** ichida (Franklin portreti o'rnida) |
| 64.7–65.3 | Kamera juda sekin uzoqlashadi, qo'l ovalda "muhr" kabi |
| 65.5 | **Morf/crossfade**: qo'l Franklin yuziga eriydi (ikkalasi ustma-ust) |
| 65.7–66.0 | Kamera orqaga — butun 100$ banknota |
| 66.4+ | Banknotalar uchadi, chetlari **yonadi** (oltin olov, zarrachalar), "University **sells**" |

**G'oya:** "Sen universitet uchun shunchaki pulsan". Qo'l = inson → banknota portreti.

**2-yozuvdan qo'shimcha detallar** (`frames/sheets/hand-to-dollar_*.jpg`, 54–60 s, tezroq scroll):
- 56.3 s: qo'l avval **oq gips haykalga** aylanadi (tirik teri → jonsiz haykal), qizil fon hali saqlanadi.
- 57.3–58.1 s: qizil fon **desaturatsiya** bo'ladi, kuchli **film grain** paydo bo'ladi, haykal-qo'l xira.
- 58.4 s: **hard cut** — Franklin portreti, boshida **bitiruvchi shapkasi (mortarboard)** — diplom/universitet ishorasi.
- 58.6–59.9 s: kamera orqaga, bir nechta banknotalar, "University sells".
- Scroll tezligiga qarab "qo'l ovalda" oraliq kadri ko'rinmasligi mumkin (1-yozuvda sekin scroll bilan ko'ringan).

## 7. Pul — "University sells … Paper"
- To'q yashil fon, orqada **bo'r doskasi** (formulalar, chizmalar) — universitet.
- 3D egilgan 100$ banknotalar uchadi, chetlari **yonib** kul bo'ladi (burn shader + uchqunlar).
- "University **sells**" → banknotalar yonib tugaydi → "**P**aper" (katta, yorqin script).
- Sichqoncha **parallaksi** bu yerda aniq tekshirildi: kursor burchakdan burchakka o'tganda fon ~30px teskari tomonga siljiydi, yaqin/uzoq qatlamlar har xil tezlikda.

## 8. "but Companies want Someone who can do the Job"
- Qora-yashil fon, **yirtilgan qog'oz lentalari** (diplomlar maydalangan — shredded certificates) sekin suzadi.
- Lentalar orasida **gazeta kesmalari** — kompaniya rahbarlarining iqtiboslari (portret + matn), masalan: "There's no need to have a college degree at all. I look for evidence of exceptional ability."
- Matn: "but **C**ompanies" (chap yuqori) → "want **S**omeone" (o'ng past) → "who can do the" → "**J**ob" (markaz, glow).

## 9. "see the Disconnect" → "and that's Why we had to Exist"
- 70–87 s: qorong'i fon, qog'oz lentalari, markazda "see the **D**isconnect".
- 88 s: lentalar yo'qoladi — qop-qora bo'shliq, yulduzdek kichik nuqtalar. Chap yuqorida "and that's **W**hy".
- 91.0 s: o'ng pastda "we had to **E**xist" — ikki yozuv diagonalda qarama-qarshi.
- 91.4–93.0 s: markazdagi oq nuqta atrofida **segmentli yashil 3D halqa** paydo bo'ladi (bir necha qavat, aylanadi), 93.0 da katta shockwave-halqa o'tib ketadi.
- 93.4 s+: faqat halqa qoladi, **TAP HOLD** kutadi.

## 10. Ikkinchi TAP HOLD — "nafas" o'tishi ⭐

| Vaqt | Nima bo'ladi |
|---|---|
| 130.6 | 👆 Bosish boshlanadi |
| 130.6–131.2 | Orqadagi katta yashil shakllar halqa atrofida aylanib markazga tortiladi |
| 131.4–132.4 | **Siqilish**: halqa kichrayib nuqtaga aylanadi, ekran zulmatga cho'kadi (nafas ushlash) |
| 132.6–133.2 | **Teskari**: halqalar kengayadi, ko'p qavatli "aks-sado" halqalar, markaz yorqinlashadi |
| 133.4–133.6 | Ichki halqa yorqin yashil yonadi, markaz oq |
| 133.8 | **1-yashil chaqnash** — ekran yashil nurga to'ladi, halqa gul shaklida ochiladi |
| 134.1–134.4 | Markazdagi oq "quyosh" kattalashadi, halqa bo'laklari nur tolalariga aylanadi |
| 134.5 | **2-chaqnash** (bir kadrlik, och yashil) |
| 134.6–134.9 | Hammasi **oq nurga eriydi** |
| 135.0–135.3 | Toza oq ekran — "yangi dunyo" pauzasi |
| 135.6 | Juda kichik "Introducing" paydo bo'ladi |
| 135.9–136.6 | Yozuv kattalashadi, chapdan **bulutlar** kiradi |
| 137–140 | Bulutlar orasidan **yuqoridan ko'rilgan shahar** ochila boshlaydi |

**Rejissyorlik:** siqilish → portlash → yangi dunyo. Birinchi TAP HOLD (jannat → zulmat) ning teskari ko'zgusi. Og'ir 3D model yo'q — halqa geometriyasi + bloom + fade + kamera masshtabi.

## 11. Yechim — "Introducing zero"
- Oq fon, bulutlar orasidan kamera pastga tushadi.
- "**I**ntroducing" → katta gradientli "**zero**" logotipi (ko'kish-kulrang metall gradient).
- "where **WORK** gets **R**eal" → "**R**eal **projects** from companies" → "**R**eal **tools** that teams use everyday" → "**R**eal **skills** that employers need" — har safar bulutlar biroz tarqaladi.
- "GET **H**ired into" → "world's most in-demand **C**areers" — bulutlar butunlay ochiladi.

## 12. Final — interaktiv shahar
- Yuqoridan ko'rilgan **izometrik shahar** (AI-uslubidagi detalli rasm): binolar kompaniya brendlarida (McDonald's, Netflix, Stripe, Amazon, Burger King, …), sohil, dengiz.
- Markazdagi stadion ustida **yashil gologramma gumbaz**, ichida aylanuvchi "JOIN THE WAITLIST".
- Kamera uzoqlashib butun shaharni ko'rsatadi. XP 500.
- Boshqaruv: chap pastda **joystik**, o'ng pastda **zoom +/−** va **aylantirish** tugmalari.
- Binolarda **oq hotspot nuqtalar** — bosilganda **kartochka**: kompaniya (masalan OpenAI), lavozim ("Business Analyst"), loyiha ("ChatGPT Conversion Analysis"), qisqa tavsif, vositalar (Codex, Canva, Google Sheets), "Join Beta" tugmasi.
- Hikoya mahsulotning o'zi bilan tugaydi: har bir bino = real loyiha.
