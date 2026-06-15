# BLOC — Vertical City

Landing page immersive et défilante pour **BLOC**, une marque fictive de
vêtement. Le produit héro : un pantalon **bleu profond, ultra baggy, ultra
lourd, serrable aux chevilles**, conçu pour le bitume et la falaise.

Le pantalon est un objet 3D temps réel qui tourne, zoome et traverse l'écran au
défilement pendant que des accroches apparaissent en parallaxe.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Three.js** + **@react-three/fiber** + **@react-three/drei** pour la scène 3D
- **GSAP** + **ScrollTrigger** pour les animations au scroll
- Curseur personnalisé maison (dot + ring réactif au survol)

## Le modèle 3D

Le pantalon est **généré par code** dans [`components/Pants.tsx`](components/Pants.tsx) :
un cylindre haute résolution est redessiné sur un profil « baggy » (large au
mollet, resserré à la cheville) puis plissé par du bruit trigonométrique pour
un rendu de toile lourde. Matière `MeshPhysicalMaterial` bleu profond avec
`sheen` pour l'effet tissu, éclairée par un environnement procédural
(`Lightformer`) — aucune dépendance à un fichier 3D externe / CDN, donc la
scène se charge toujours.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

## Structure

| Fichier | Rôle |
| --- | --- |
| `app/page.tsx` | Monte la scène 3D (client-only), l'overlay et le curseur |
| `app/layout.tsx` | Métadonnées, styles globaux |
| `components/Scene.tsx` | Canvas R3F, lumières, environnement, caméra |
| `components/Pants.tsx` | Géométrie + matière + animation du pantalon |
| `components/Story.tsx` | Sections de contenu + animations GSAP/ScrollTrigger |
| `components/CustomCursor.tsx` | Curseur personnalisé + parallaxe pointeur |
| `lib/scrollStore.ts` | Pont d'état entre ScrollTrigger (DOM) et la boucle 3D |

---

© BLOC — Vertical City Goods.
