# Modèles 3D

Déposez ici un vrai modèle de pantalon, par exemple `pants.glb`, puis activez-le
dans [`components/Pants.tsx`](../../components/Pants.tsx) :

```ts
const MODEL_URL = "/models/pants.glb";
```

Tant que ce dossier ne contient pas de `.glb` référencé, le pantalon
paramétrique (généré par code) est utilisé — la scène s'affiche donc toujours,
sans dépendre d'un fichier externe.

Sources de modèles `.glb` gratuits : Sketchfab (filtre « Downloadable »),
Poly Pizza, Quaternius, ou un export depuis Blender / CLO3D.
