# Charte graphique

## Couleurs (variables CSS dans `assets/css/style.css`)
| Rôle | Variable | Valeur |
|---|---|---|
| Vert profond (fonds, marque) | `--green-800` / `--green-950` | `#0f3d22` / `#071f12` |
| Vert boutons | `--green-700` | `#1a5c32` |
| Vert feuille (accents) | `--leaf` | `#6ab42d` |
| Orange (appels à l'action) | `--orange` / `--orange-600` | `#f39a3c` / `#e8900a` |
| Crème (fond clair) | `--cream` | `#faf7f0` |
| Texte | `--ink` | `#10241a` |

Mode sombre automatique (réglage du téléphone/ordinateur) ou manuel (bouton du pied de page).

## Typographie
- Titres : **Cormorant Garamond** 600, italique orange pour le mot mis en avant (`<em class="accent">`).
- Texte, boutons : **DM Sans**.
- **Chiffres : toujours en DM Sans** (dans un titre : `<span class="num">0</span>`), car le zéro de Cormorant ressemble à la lettre « o ».

## Images (`assets/img/`)
| Fichier | Usage |
|---|---|
| `logo.webp` | en-tête, pied de page (480 × 322) |
| `logo-hd.png` | logo haute définition transparent (impression, réseaux) |
| `stick.webp` | stick, accueil (900 × 624) |
| `box.webp` | boîte de 100 sticks, page Produit (900 × 1176) |
| `tooth.webp` | pictogramme dent |
| `scene-cafe.webp`, `scene-famille-cuisine.webp`, `scene-famille-the.webp`, `scene-dessert.webp`, `scene-sticks.webp` | mises en situation (640 × 480), bandes défilantes (À propos, Bienfaits, Blog, Actualités) |
| `scene-cafe-16x9.webp`, `scene-famille-the-16x9.webp`, `scene-sticks-16x9.webp` | affiches de l'espace vidéo (1280 × 720) |
| `badge-zero.webp`, `badge-dents.webp` | pastilles « 0 sucre 0 calorie » et « Protège vos dents » |

Les mises en situation viennent des visuels fournis en octobre 2026 (images générées par IA). Elles ont été recadrées pour retirer le filigrane du coin inférieur droit, et restent affichées en petit format car les textes des emballages y sont parfois déformés. Sur deux images presque identiques de famille en cuisine, une seule est utilisée. L'affiche publicitaire n'est pas utilisée sur le site. À noter : la pastille dit « Protége » au lieu de « Protège » (accent).

Point connu : le badge dent du rendu `stick.webp` contient un texte illisible généré par IA. À remplacer par une vraie photo produit.

## Animations
- Bande de texte verte (accueil) et bandes de photos (`.photo-band`, sur 4 pages seulement pour éviter la monotonie) : défilement continu, pause au survol, au clavier et avec le bouton pause.
- Espace vidéo (`.videos-sec`) : fond vert profond, lecteur 16:9, bouton lecture orange.
- Si le visiteur a demandé « réduire les animations » dans son système, rien ne défile : les bandes deviennent une rangée que l'on fait glisser soi-même.

## Ton
Simple, chaleureux, rassurant. Phrases courtes. Mettre en avant 0 sucre, 0 calorie, sans pic glycémique, bon pour les dents, fabriqué au Sénégal. Usages locaux : café, thé, ataya, kinkéliba, bissap, bouillie.
