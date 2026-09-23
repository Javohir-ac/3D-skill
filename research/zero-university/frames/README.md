# Zero — kadrlar va video

Hammasi **bitta to'liq yozuvdan** olingan: `../video/zero-960.mp4` (348.7 s, 960px, 30fps, ovozsiz). Yozuv `tools/site-recorder/record-zero.js` bilan headless Chrome'da (haqiqiy GPU, 1440×810) qilingan. Vaqtlar — shu video ichidagi soniyalar.

## Muhim vaqtlar (`../video/marks.json`)
| Vaqt | Hodisa |
|---|---|
| 0.00 | Yozuv boshlandi (intro, DRAW A ZERO) |
| 1.52 | Nol chizildi → muz teshiladi → +100 XP |
| 19.83 | 1-TAP HOLD ko'rindi |
| 20.05 | 1-hold bosildi (haqiqiy sichqoncha bilan ~1.2 s dan keyin o'tish boshlanadi) |
| 34.54 | 1-hold qo'yib yuborildi |
| 82.35 | 2-TAP HOLD ko'rindi |
| 82.44 | 2-hold bosildi |
| 96.69 | 2-hold qo'yib yuborildi |
| 343.2 | Final (interaktiv shahar) |

## `sheets/` — kadr jadvallari (har katakda absolyut vaqt)
| Fayl | Nima | Qadam |
|---|---|---|
| `overview_01…06.jpg` | Butun sayt, har 3 s bitta kadr (5×4) | 3 s |
| `intro-draw_01.jpg` | Nol chizish → muz teshilishi → XP | 0.2 s |
| `hold1-transition_01-02.jpg` | ⭐ 1-TAP HOLD: o'rta barmoq → qizil cho'kish → zulmat → sindirish → "But." → "Bullsh\*t" | 0.2 s |
| `hand-to-dollar_01-02.jpg` | ⭐ Qo'l → gips haykal → desaturatsiya+grain → Franklin (bitiruvchi shapkada) | 0.25 s |
| `hold2-transition_01-02.jpg` | ⭐ 2-TAP HOLD: siqilish → portlash → oq → Introducing | 0.2 s |

## `shots/` — to'liq ekran skrinshotlari (HTML overlay'lar bilan!)
Canvas yozuvida ko'rinmaydigan HTML elementlar (TAP HOLD halqasi, XP, progress chizg'ichi, hotspot kartochkalar) shu yerda bor.
Fayl nomi: `NNN_<vaqt>s_<holat>.jpg` — masalan `014_19.8s_hold1-visible.jpg`, `015_20.6s_hold1-pressing.jpg`.
Holatlar: `intro`, `after-draw`, `scrollN`, `holdK-visible`, `holdK-pressing` (har 0.5 s), `holdK-after`, `final`.
