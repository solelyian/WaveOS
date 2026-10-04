# WaveOS — Prototype mobile

Prototype interactif de la couche UX/UI de WaveOS mobile, fiabilisé à partir de la maquette initiale (`os_concept_ui.tsx`).

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS 3.4** (tokens `wave.cyan` `#00C2FF`, `wave.deep` `#0090C8`, `wave.ink`)
- **Framer Motion 11** — morphing icône → fenêtre, springs physiques (`src/system/tokens.ts`)
- **Lucide** pour l'iconographie

## Lancer

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # vérif TS + bundle de prod
```

Le prototype se présente comme un châssis de téléphone (400×850) centré dans la page.

## Architecture

```
src/
├─ App.tsx               # Shell : bezel, wallpaper, ordre des couches système
├─ system/
│  ├─ tokens.ts          # ACCENT, SPRINGS, RADIUS, GLASS, SWITCHER, constantes
│  ├─ OSContext.tsx      # État global : fenêtres persistantes, shades, radios,
│  │                     #   clavier (registry de "sinks"), langue, toasts
│  ├─ i18n.tsx           # EN/FR complet — Settings → Language bascule tout l'OS
│  ├─ AppLayer.tsx       # Gestionnaire de fenêtres + app switcher (cartes live)
│  ├─ HomeScreen.tsx     # SpringBoard : widgets, grille, dock, rects d'icônes
│  ├─ GestureLayer.tsx   # Zones de drag haut-gauche/droite → Notifications/CC
│  ├─ HomeIndicator.tsx  # Barre globale : pilote la fenêtre active ou le switcher
│  ├─ ControlCenter.tsx  # Radios, média, sliders luminosité/volume, utilitaires
│  ├─ NotificationCenter.tsx
│  ├─ FlowIsland.tsx     # "Île" dynamique : focus, lampe, lecture média
│  ├─ Keyboard.tsx       # Clavier système AZERTY/QWERTY/symboles (écrit dans les sinks)
│  ├─ LockScreen.tsx     # Horloge localisée → swipe → pavé passcode (4 chiffres)
│  ├─ BootScreen.tsx     # Splash "WaveOS" + onde cyan
│  ├─ StatusBar.tsx      # Heure locale, encre adaptative selon le thème de l'app
│  └─ Toast.tsx
├─ ui/kit.tsx            # NavBar, TabBar, Toggle, ListRow, Wordmark — composants réutilisés
└─ apps/                 # Les 11 apps : registry.tsx + un fichier par app
```

## Ce qui a été fiabilisé vs la maquette initiale

| Problème initial | Correction |
|---|---|
| Une seule app à la fois, état détruit à chaque fermeture | Fenêtres persistantes montées (`openApps`) + switcher avec aperçus **live** |
| Gestes `onMouseEnter` (impossibles au tactile) | Vraies zones de drag pointeur haut/bas + seuils de vélocité |
| Calculatrice morte | Moteur réel (opérandes, chaînage, ±, %) |
| Onglets/sections vides | Toutes les sections des 11 apps rendent du contenu |
| Accent `blue-500` générique + "Safari" | Accent cyan `#00C2FF` du logo, app renommée **Surf**, splash WaveOS |
| Statut blanc illisible sur apps claires | Encre adaptative selon le thème de l'app au premier plan |
| ~10 rayons incohérents | Échelle `RADIUS` centralisée + rayons système unifiés (60 fenêtre / 22 icône) |
| Horodatages `en-US` en dur | i18n EN/FR complète (Settings → Language), Intl localisés |
| Entrées clavier impossibles | Clavier système bottom-sheet branché sur un registry de champs |
| A11y absente | rôles/aria-labels, interrupteurs `role=switch`, cibles ≥ 44px |

## Gestes

- **Verrouillage** : glisser vers le haut → pavé à 4 chiffres (n'importe quel code déverrouille).
- **Accueil** : tap sur une icône → morphing vers la fenêtre.
- **Dans une app** : la barre du bas pilote la fenêtre — tiré long/fling = fermer, tiré court = switcher.
- **Switcher** : tap = focus, glisser la carte vers le haut = quitter, fond = fermer.
- **Bords hauts** : drag vers le bas à gauche = notifications, à droite = centre de contrôle.
- **Champs texte** : ouvrent le clavier système ; ⏎ valide (envoi dans Messages/Mail, navigation dans Surf).

## Limites assumées (prototype)

- Données fictives en dur, pas de backend ; la "navigation" Surf rend une page factice.
- Les aperçus du switcher sont les apps réelles rétrécies — fidèle, mais coûteux si beaucoup d'apps restent ouvertes.
- Un seul écran de verrouillage avec code factice.
