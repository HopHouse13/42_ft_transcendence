# Fiche CSS - Guide Complet

## Table des matières
1. [Introduction au CSS](#1-introduction-au-css)
2. [Structure d'un fichier CSS](#2-structure-dun-fichier-css)
3. [Sélecteurs CSS](#3-sélecteurs-css)
4. [Propriétés CSS par catégorie](#4-propriétés-css-par-catégorie)
5. [Sélecteurs utilisés dans le projet Othello](#5-sélecteurs-utilisés-dans-le-projet-othello)
6. [Propriétés utilisées dans le projet Othello](#6-propriétés-utilisées-dans-le-projet-othello)
7. [Bonnes pratiques](#7-bonnes-pratiques)
8. [Exemple complet annoté](#8-exemple-complet-annoté)

---

## 1. Introduction au CSS

CSS (Cascading Style Sheets) est un langage de styles utilisé pour décrire la présentation d'un document HTML. Il permet de séparer le contenu (HTML) de la présentation (CSS).

### Principes de base :
- Cascading : Les styles s'appliquent en cascade (le dernier style déclaré écrase le précédent)
- Spécificité : Un sélecteur plus spécifique a la priorité sur un sélecteur moins spécifique
- Héritage : Les enfants hérite des styles des parents (pour certaines propriétés)

---

## 2. Structure d'un fichier CSS

```css
/* C'est un commentaire CSS */

/* Structure : Sélecteur { Propriété: valeur; } */
selector {
    property: value;
    property: value;
}

/* Plusieurs sélecteurs peuvent partager les mêmes styles */
selector1, selector2 {
    property: value;
}
```

### Organisation recommandée :
```css
/* ===== RESET/BASE ===== */
* { box-sizing: border-box; }

/* ===== VARIABLES ===== */
:root {
    --primary-color: #4ade80;
}

/* ===== STYLES GLOBAUX ===== */
body { ... }

/* ===== COMPOSANTS ===== */
.button { ... }

/* ===== UTILITAIRES ===== */
.text-center { ... }

/* ===== MEDIA QUERIES ===== */
@media (max-width: 768px) { ... }
```

---

## 3. Sélecteurs CSS

### Sélecteurs de base :

| Sélecteur | Description | Exemple |
|-----------|-------------|---------|
| `*` | Sélecteur universel (tous les éléments) | `* { margin: 0; }` |
| `element` | Sélecteur de type (balise HTML) | `div { ... }`, `p { ... }` |
| `.class` | Sélecteur de classe | `.square { ... }` |
| `#id` | Sélecteur d'ID (unique par page) | `#board { ... }` |
| `[attribute]` | Sélecteur d'attribut | `[disabled] { ... }` |

### Sélecteurs combinés :

| Sélecteur | Description | Exemple |
|-----------|-------------|---------|
| `selector1 selector2` | Sélecteur descendant | `.board .square { ... }` |
| `selector1 > selector2` | Sélecteur enfant direct | `.board > .row { ... }` |
| `selector1 + selector2` | Sélecteur frère adjacent | `h1 + p { ... }` |
| `selector1 ~ selector2` | Sélecteur frère général | `h1 ~ p { ... }` |

### Sélecteurs de pseudo-classes :

| Sélecteur | Description | Exemple |
|-----------|-------------|---------|
| `:hover` | Quand la souris survole | `.square:hover { ... }` |
| `:active` | Quand l'élément est cliqué | `button:active { ... }` |
| `:first-child` | Premier enfant | `.board-row:first-child { ... }` |
| `:last-child` | Dernier enfant | `.square:last-child { ... }` |
| `:nth-child(n)` | n-ième enfant | `li:nth-child(2) { ... }` |

### Sélecteurs de pseudo-éléments :

| Sélecteur | Description | Exemple |
|-----------|-------------|---------|
| `::before` | Insère du contenu avant | `.pawn::before { ... }` |
| `::after` | Insère du contenu après | `.board-row:after { ... }` |

---

## 4. Propriétés CSS par catégorie

### 4.1. Box Model (Modèle de boîte)

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `width` | Largeur de l'élément | `px`, `%`, `auto`, `max-content` | `width: 100px` |
| `height` | Hauteur de l'élément | `px`, `%`, `auto`, `max-content` | `height: 200px` |
| `min-width` | Largeur minimale | `px`, `%`, `auto` | `min-width: 320px` |
| `max-width` | Largeur maximale | `px`, `%`, `none` | `max-width: 600px` |
| `margin` | Marge extérieure | `px`, `%`, `auto`, `inherit` | `margin: 10px 20px` |
| `padding` | Remplissage intérieur | `px`, `%`, `inherit` | `padding: 8px 10px` |
| `border` | Bordure (raccourci) | `width style color` | `border: 1px solid #000` |
| `border-radius` | Rayon des coins arrondis | `px`, `%` | `border-radius: 8px` |
| `box-sizing` | Calcul de la boîte | `content-box`, `border-box` | `box-sizing: border-box` |

### 4.2. Display & Positionnement

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `display` | Type d'affichage | `block`, `inline`, `inline-block`, `flex`, `grid`, `none` | `display: flex` |
| `position` | Type de positionnement | `static`, `relative`, `absolute`, `fixed`, `sticky` | `position: absolute` |
| `top`, `right`, `bottom`, `left` | Position | `px`, `%`, `auto` | `top: 50%` |
| `z-index` | Ordre de superposition | nombre (entier) | `z-index: 10` |
| `float` | Flottaison | `left`, `right`, `none` | `float: left` |
| `clear` | Nettoyage des floats | `left`, `right`, `both`, `none` | `clear: both` |

### 4.3. Flexbox

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `flex-direction` | Direction des éléments | `row`, `column`, `row-reverse`, `column-reverse` | `flex-direction: row` |
| `flex-wrap` | Retour à la ligne | `nowrap`, `wrap`, `wrap-reverse` | `flex-wrap: wrap` |
| `justify-content` | Alignement horizontal | `flex-start`, `center`, `space-between` | `justify-content: center` |
| `align-items` | Alignement vertical | `flex-start`, `center`, `stretch` | `align-items: center` |
| `align-self` | Alignement individuel | `auto`, `flex-start`, `center` | `align-self: flex-start` |
| `gap` | Espacement entre éléments | `px`, `em` | `gap: 20px` |
| `flex` | Raccourci | `number`, `auto`, `none` | `flex: 1` |
| `flex-grow` | Capacité à grandir | nombre | `flex-grow: 1` |
| `flex-shrink` | Capacité à rétrécir | nombre | `flex-shrink: 0` |

### 4.4. Textes

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `color` | Couleur du texte | `hex`, `rgb()`, `named colors` | `color: #e8e8e8` |
| `font-family` | Police | Nom de police, `serif`, `sans-serif` | `font-family: 'Segoe UI', sans-serif` |
| `font-size` | Taille du texte | `px`, `em`, `rem`, `%` | `font-size: 14px` |
| `font-weight` | Épaisseur | `normal`, `bold`, `100-900` | `font-weight: 600` |
| `text-align` | Alignement | `left`, `right`, `center` | `text-align: center` |

### 4.5. Couleurs et Arrière-plans

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `background` | Raccourci arrière-plan | `color`, `url()`, `gradient` | `background: #1a4d2e` |
| `background-color` | Couleur de fond | `hex`, `rgb()`, `rgba()` | `background-color: rgba(0,0,0,0.3)` |
| `background-image` | Image de fond | `url()`, `gradient` | `background-image: linear-gradient(...)` |
| `opacity` | Opacité | `0` à `1` | `opacity: 0.7` |

### 4.6. Ombres

```css
box-shadow: offsetX offsetY blur spread color;
/* Exemple : */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
/* Ombre intérieure : */
box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
```

### 4.7. Transitions et Animations

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `transition` | Transition | `property duration timing-function` | `transition: all 0.2s ease` |
| `transition-property` | Propriétés animées | `all`, `width`, `background-color` | `transition-property: all` |
| `transition-duration` | Durée | `s`, `ms` | `transition-duration: 0.2s` |
| `transition-timing-function` | Courbe | `ease`, `linear` | `transition-timing-function: ease` |
| `transform` | Transformation | `translate()`, `scale()`, `rotate()` | `transform: translateY(-1px)` |

### Animation avec @keyframes

```css
@keyframes nom-animation {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
}
.element {
    animation: nom-animation 1.5s infinite;
}
```

### 4.8. Listes

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `list-style` | Style de liste | `disc`, `circle`, `none` | `list-style: none` |

### 4.9. Défilement

| Propriété | Description | Valeurs possibles | Exemple |
|-----------|-------------|-------------------|---------|
| `overflow` | Comportement | `visible`, `hidden`, `scroll`, `auto` | `overflow: auto` |
| `overflow-y` | Débordement vertical | `visible`, `auto`, `scroll` | `overflow-y: auto` |

### 4.10. Aspect Ratio

| Propriété | Description | Valeurs | Exemple |
|-----------|-------------|---------|---------|
| `aspect-ratio` | Ratio largeur/hauteur | `1/1`, `16/9` | `aspect-ratio: 1/1` |

### 4.11. Filtres

| Propriété | Description | Valeurs | Exemple |
|-----------|-------------|---------|---------|
| `backdrop-filter` | Filtre sur l'arrière-plan | `blur()`, `brightness()` | `backdrop-filter: blur(10px)` |
| `filter` | Filtre sur l'élément | `blur()`, `brightness()` | `filter: blur(5px)` |

### 4.12. Curseur

| Propriété | Description | Valeurs | Exemple |
|-----------|-------------|---------|---------|
| `cursor` | Apparence du curseur | `pointer`, `default`, `text` | `cursor: pointer` |

---

## 5. Sélecteurs utilisés dans le projet Othello

### Sélecteurs universels et de type :
- `*` : Sélecteur universel (reset du box-sizing)
- `body` : Style global de la page
- `h1, h2, h3, h4, h5, h6` : Styles des titres
- `code` : Style du code inline
- `ul` : Style des listes non ordonnées
- `ol` : Style des listes ordonnées
- `button` : Style de base de tous les boutons

### Sélecteurs de classe :
- `.game` : Conteneur principal
- `.game-board` : Conteneur du plateau
- `.game-info` : Conteneur de l'historique
- `.board-container` : Conteneur plateau + statut
- `.board` : Grille 8x8
- `.board-row` : Ligne du plateau
- `.square` : Case du plateau
- `.possible-move` : Case jouable
- `.possible-move-indicator` : Indicateur visuel
- `.pawn` : Pion (base)
- `.black-pawn` : Pion noir (X)
- `.white-pawn` : Pion blanc (O)
- `.status` : Barre de statut
- `.toggle-button` : Bouton Reverse
- `.pass-button` : Bouton Pass Turn
- `.move-info` : Indicateur coup actuel

### Sélecteurs combinés :
- `.board-row .square:last-child` : Dernière case de chaque ligne
- `.board-row:last-child .square` : Cases de la dernière ligne
- `.square.possible-move` : Case avec surbrillance
- `.square.possible-move:hover` : Case valide au survol
- `ol li` : Éléments de l'historique
- `ol button` : Boutons d'historique
- `ol button:hover` : Boutons d'historique au survol

### Pseudo-éléments :
- `.board-row:after` : Nettoyage des floats

### Pseudo-classes :
- `.square:hover`, `button:hover`, `.pawn:hover` : Effets de survol
- `button:active` : Bouton activé

---

## 6. Propriétés utilisées dans le projet Othello

### Box Model :
- `box-sizing: border-box` (sur tous les éléments)
- `margin: 0`, `margin: 20px`, `margin: 0 auto`, `margin-bottom: 10px`
- `padding: 20px`, `padding: 8px 10px`, `padding: 6px 12px`
- `padding-inline-start: 20px`
- `border: none`, `border-right: 1px solid rgba(0,0,0,0.2)`, etc.
- `border-radius: 8px`, `border-radius: 12px`, `border-radius: 50%`
- `width: 100%`, `width: 12.5%`, `width: 24%`, `width: 70%`
- `height: calc(100vh - 40px)`, `height: 24%`
- `max-width: 600px`, `min-width: 320px`, `min-width: 200px`
- `max-height: 100%`, `min-height: 100vh`

### Display & Positionnement :
- `display: flex` (conteneurs flexibles)
- `flex-direction: row`, `flex-direction: column`
- `flex-wrap: wrap`
- `gap: 20px`, `gap: 10px`
- `flex: 1`, `flex-shrink: 0`
- `position: relative`, `position: absolute`, `position: sticky`
- `top: 50%`, `left: 50%`
- `transform: translate(-50%, -50%)`, `transform: translateY(-1px)`, `transform: scale(...)`
- `z-index: 1`, `z-index: 10`
- `float: left`, `clear: both`

### Textes :
- `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- `font-size: 22px`, `font-size: 14px`, `font-size: 13px`, `font-size: 12px`, `font-size: 1.2em`
- `font-weight: 600`
- `color: #e8e8e8`, `color: #f0f0f0`, `color: #a8a8a8`
- `text-align: center`, `text-align: left`

### Couleurs & Arrière-plans :
- `background: linear-gradient(...)` (dégradés divers)
- `background: rgba(0, 0, 0, 0.3)` (semi-transparent)
- `background: radial-gradient(circle, #4ade80 0%, #16a34a 100%)`

### Ombres :
- `box-shadow: 0 10px 30px rgba(0,0,0,0.4)` (ombre de game-board)
- `box-shadow: inset 0 0 20px rgba(0,0,0,0.5)` (ombre intérieure plateau)
- `box-shadow: inset 0 0 0 2px #4ade80` (bordure verte coups valides)
- `box-shadow: 0 0 10px #4ade80` (lueur indicateur)

### Transitions & Animations :
- `transition: all 0.2s ease`
- `transition: transform 0.15s ease`
- `animation: pulse 1.5s infinite`

### Autres :
- `aspect-ratio: 1/1` (carré parfait)
- `backdrop-filter: blur(10px)` (flou arrière-plan)
- `cursor: pointer` (main sur les boutons)
- `content: ''` (pseudo-éléments)
- `overflow-y: auto`, `overflow-y: scroll`
- `list-style: none`

---

## 7. Bonnes pratiques

### Organisation du code :
1. Ordre logique : Globaux → Composants → Utilitaires
2. Regrouper les sélecteurs avec des commentaires
3. Noms de classes descriptifs (ex: `.board-container`)
4. Éviter les IDs, privilégier les classes

### Performance :
1. Éviter `*` dans les animations
2. Limiter la profondeur des sélecteurs
3. Utiliser `transform` et `opacity` pour les animations (GPU-accéléré)

### Accessibilité :
1. Contraste des couleurs suffisant
2. States visuels (:hover, :focus)
3. Unités relatives (em, rem, %) quand possible

### Responsive Design :
1. Flexbox/Grid pour les layouts flexibles
2. Media queries pour les adaptations écran
3. Unités viewport (vw, vh)

---

## 8. Exemple complet annoté

```css
/**
 * Exemple : Une case du plateau de jeu Othello
 * Ce bloc explique toutes les propriétés utilisées
 */

.square {
    /* Fond dégradé vert foncé */
    background: linear-gradient(145deg, #1a3e1c 0%, #2d5a2e 100%);
    
    /* Bordures entre les cases */
    border-right: 1px solid rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    
    /* Flottaison pour créer la grille */
    float: left;
    
    /* 12.5% = 1/8 pour 8 colonnes */
    width: 12.5%;
    
    /* Ratio 1:1 pour carré parfait */
    aspect-ratio: 1/1;
    
    /* Position relative pour les pions */
    position: relative;
    
    /* Animation fluide */
    transition: all 0.2s ease;
    
    /* Ombre intérieure */
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Effet de survol */
.square:hover {
    background: linear-gradient(145deg, #2a5e2c 0%, #3d6a3e 100%);
    transform: scale(1.02);
    z-index: 1;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Indicateur de coup valide */
.possible-move-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24%;
    height: 24%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    background: radial-gradient(circle, #4ade80 0%, #16a34a 100%);
    box-shadow: 0 0 10px #4ade80, 0 0 20px rgba(74, 222, 128, 0.3);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

/* Nettoyage des floats */
.board-row:after {
    clear: both;
    content: '';
    display: table;
}
```

---

## Conclusion

Ce guide couvre l'essentiel du CSS utilisé dans le projet Othello. Pour aller plus loin, consultez :
- **MDN Web Docs** : [https://developer.mozilla.org/fr/docs/Web/CSS](https://developer.mozilla.org/fr/docs/Web/CSS)
- **CSS Tricks** : [https://css-tricks.com/](https://css-tricks.com/)

Le fichier CSS du projet utilise principalement **Flexbox** pour la structure, des **dégradés** pour les couleurs, et des **animations subtiles** pour l'interactivité.
