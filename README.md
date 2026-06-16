# BLOC — Vertical City

Landing page immersive et défilante pour **BLOC**, une marque fictive de
vêtement. Le produit héro : un pantalon **bleu profond, ultra baggy, ultra
lourd, serrable aux chevilles**, conçu pour le bitume et la falaise.

Le site est construit autour de **vraies photos** : des photographies de
montagne / escalade en fond (parallaxe au défilement) et le **pantalon en photo
produit** (face / dos) qui se retourne au scroll.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **GSAP** + **ScrollTrigger** (parallaxe, révélations, retournement du produit)
- Curseur personnalisé maison (dot + ring réactif au survol + parallaxe pointeur)

## Vos visuels du pantalon

Les images du jean sont des **placeholders**. Pour mettre vos deux visuels :

1. Enregistrez votre **face** dans `public/images/jean-front.jpg`
2. Enregistrez votre **dos** dans `public/images/jean-back.jpg`
   (gardez ces noms ; sinon, modifiez les chemins dans
   [`lib/site.ts`](lib/site.ts)).

C'est tout — le héros (retournement face/dos), la galerie d'achat et la section
« cheville » utilisent ces deux fichiers automatiquement.

## Les photos de fond

Photos libres (Unsplash) téléchargées dans `public/images/` :
`bg-cliff` (héros, grimpeur au coucher de soleil), `bg-range` (chaîne pastel),
`bg-summit` (crête herbeuse), `bg-valley` (ciel crépusculaire). Centralisées
dans [`lib/site.ts`](lib/site.ts).

## Le site

Héros photo + pantalon flottant qui se retourne · scènes cinématiques en
parallaxe (Ultra Lourd, Serré aux chevilles, Bitume & Falaise) · marquee ·
chiffres clés · cartes features · lookbook · **module d'achat** (sélecteur de
taille, ajout panier, face + dos) · presse · avis · **FAQ accordéon** ·
**newsletter** sur photo · footer multi-colonnes.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

---

© BLOC — Vertical City Goods. Photos de fond : Unsplash (licence libre).
