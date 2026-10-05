# Örkened berättar – QR-guide för bygdegården

Mobilwebb för Örkeneds Hembygdsförening. Besökaren skannar en QR-kod vid ett föremål och får ljud, film och text. Ingen app, inga kakor.

Byggd enligt *Spec QR-guide för bygdegården (mobilwebb)* och designriktning **1a "Klassisk"** från Claude Design-mockupen.

## Kom igång

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # statisk sajt i out/ (+ kortlänkar /12 → /o/vavstolen/)
```

`out/` kan läggas upp på Cloudflare Pages, Netlify eller valfritt webbhotell.

## Lägga till eller ändra ett föremål

En fil per föremål i `content/objekt/`, t.ex. `12-vavstolen.sv.md`:

```yaml
---
nummer: 12            # står på skylten, ändras aldrig
slug: vavstolen       # a–z, 0–9, bindestreck
titel: Vävstolen från Småland
ingress: Max 40 ord, visas högst upp.
heroBild:
  src: /bilder/12-vavstolen.jpg   # valfri, lägg filen i public/bilder/
  alt: Vävstolen på vinden        # obligatorisk
ljud:                             # valfritt
  fil: /ljud/12-vavstolen.mp3     # lägg filen i public/ljud/
  langdSek: 185
  berattare: Lars Persson
  transkript: Obligatoriskt om ljud finns.
video:                            # valfritt
  youtubeId: abc123               # tomt = "Filmen är inte uppladdad än"
  titel: Vävstolen i arbete
  langdSek: 80
  textning: true
fakta:
  - Årtal: 1890-tal
vissteDu: En mening för barn.
rum: vinden                       # slug från content/rum/
relaterade: [7, 9]                # visas åt båda hållen
lankar:
  - titel: Digitalt Museum
    url: https://digitaltmuseum.se/
uppdaterad: 2026-10-05
---
Brödtext i Markdown. Efter ca 150 ord visas "Läs mer".
```

Rum ligger i `content/rum/`, rundturer i `content/turer/` (ordningen i `objekt:` är rundturens ordning).
Bygget stoppar med ett tydligt felmeddelande om t.ex. ett nummer används två gånger eller ett relaterat föremål saknas.

> Exempelinnehållet är fiktivt (från specen). Ljudfiler och YouTube-id saknas än, så ljudspelaren visar felläget och filmen visar "inte uppladdad".

## Inte gjort än

- Service worker / offline (spec §7)
- QR-koder och A6-skyltar (spec §6)
- Engelska (språkväljaren visas men EN är inaktiv)
- Cookiefri statistik
