# BLOC — Vertical City

Landing page immersive et défilante pour **BLOC**, une marque fictive de
vêtement. Le produit héro : un pantalon **bleu profond, ultra baggy, ultra
lourd, serrable aux chevilles**, conçu pour le bitume et la falaise.

Au défilement, le pantalon **traverse une chaîne de montagnes 3D** et **grimpe
vers le sommet** pendant que la lumière passe du **jour au crépuscule puis à la
nuit étoilée**. Des accroches apparaissent en parallaxe, puis le site bascule
sur une vraie page produit (fiche, tailles, FAQ, newsletter…).

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Three.js** + **@react-three/fiber** + **@react-three/drei** pour la scène 3D
- **GSAP** + **ScrollTrigger** pour les animations au scroll
- **simplex-noise** pour le relief des montagnes
- Curseur personnalisé maison (dot + ring réactif au survol)

## La scène 3D

| Élément | Fichier | Détail |
| --- | --- | --- |
| Montagnes | [`components/Mountains.tsx`](components/Mountains.tsx) | Deux chaînes (FBM ridgé), facettes low-poly stylisées, neige sur les crêtes, parallaxe au scroll |
| Pantalon | [`components/Pants.tsx`](components/Pants.tsx) | Jambes en tubes elliptiques balayés le long d'une courbe (genou plié, cheville resserrée), ceinture + bracelets de cheville, toile bleu profond `sheen` |
| Atmosphère | [`components/Atmosphere.tsx`](components/Atmosphere.tsx) | Ciel/brouillard/soleil jour → crépuscule → nuit, étoiles, neige qui dérive |
| Caméra | [`components/Scene.tsx`](components/Scene.tsx) | Plan de suivi : la caméra reste verrouillée sur le pantalon pendant l'ascension |
| Trajectoire | [`lib/journey.ts`](lib/journey.ts) | Chemin partagé pantalon + caméra, fonction du scroll |

### Brancher un vrai modèle (.glb)

Le pantalon est **paramétrique** par défaut (aucune dépendance à un fichier
externe, donc il s'affiche toujours). Pour utiliser un vrai modèle :

1. Déposez votre fichier dans `public/models/pants.glb`.
2. Dans [`components/Pants.tsx`](components/Pants.tsx), passez
   `const MODEL_URL = "/models/pants.glb";`

Le placement, l'animation d'ascension et le recolorage bleu profond
fonctionnent tels quels.

## Le site

Après la séquence cinématique : bandeau marquee, chiffres clés, cartes de
features, lookbook, **module d'achat interactif** (sélecteur de taille, ajout au
panier), bandeau presse, avis clients, **FAQ accordéon**, **formulaire
newsletter** et footer multi-colonnes.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

---

© BLOC — Vertical City Goods.
