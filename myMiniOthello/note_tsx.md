# Fiche TypeScript/React - Guide Complet pour Reconstruire App.tsx

## Table des matières
0. [Configuration du projet](#0-configuration-du-projet)
1. [Introduction à React et TypeScript](#1-introduction-%C3%A0-react-et-typescript)
2. [Pourquoi TypeScript avec React ?](#2-pourquoi-typescript-avec-react)
3. [Structure du projet Othello en TypeScript](#3-structure-du-projet-othello-en-typescript)
4. [Étapes pour recréer App.tsx de zéro](#4-%C3%89tapes-pour-recr%C3%A9er-apptx-de-z%C3%A9ro)
5. [Types TypeScript](#5-types-typescript)
6. [Interfaces TypeScript](#6-interfaces-typescript)
7. [Composants React avec TypeScript](#7-composants-react-avec-typescript)
8. [Keywords JavaScript/TypeScript](#8-keywords-javascripttypescript)
9. [Keywords React](#9-keywords-react)
10. [Logique du jeu Othello](#10-logique-du-jeu-othello)
11. [Algorithmes expliqués](#11-algorithmes-expliqu%C3%A9s)
12. [Bonnes pratiques TypeScript](#12-bonnes-pratiques-typescript)
13. [Exemples complets annotés](#13-exemples-complets-annot%C3%A9s)

---

## 0. Configuration du projet

### 0.1. Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Node.js** (version 16 ou supérieure recommandée)
- **npm** ou **yarn** (gestionnaire de paquets)
- Un **éditeur de code** (VS Code, WebStorm, etc.)

> 💡 **Vérification** : Exécute `node -v` et `npm -v` dans un terminal pour confirmer les installations.

---

### 0.2. Création du projet avec Create React App + TypeScript

Pour créer un nouveau projet React avec TypeScript, exécute la commande suivante :

```bash
npx create-react-app my-othello --template typescript
```

Cette commande :
1. Crée un dossier `my-othello`
2. Installe React, TypeScript et toutes les dépendances nécessaires
3. Configure automatiquement `tsconfig.json` et les fichiers de base

---

### 0.3. Structure du projet généré

```
my-othello/
├── node_modules/          # Dépendances npm
├── public/               # Fichiers statiques
│   ├── index.html        # Point d'entrée HTML
│   └── ...
├── src/                  # Code source TypeScript/React
│   ├── App.tsx           # Composant principal
│   ├── index.tsx         # Point d'entrée de l'application
│   ├── react-app-env.d.ts # Déclarations TypeScript pour CRA
│   └── ...
├── package.json          # Configuration npm et scripts
├── tsconfig.json         # Configuration TypeScript
└── ...
```

---

### 0.4. Scripts disponibles

Dans `package.json`, tu trouveras les scripts suivants :

| Script | Commande | Description |
|--------|----------|-------------|
| **start** | `npm start` | Démarre l'application en mode développement |
| **build** | `npm run build` | Crée une version optimisée pour la production |
| **test** | `npm test` | Lance les tests |
| **eject** | `npm run eject` | Éjecte la configuration (irréversible) |

> ⚠️ **Conseil** : Utilise toujours `npm start` pour développer. Le serveur se rafraîchit automatiquement aux modifications.

---

### 0.5. Configuration TypeScript (`tsconfig.json`)

Le fichier `tsconfig.json` généré par CRA contient déjà une configuration adaptée :

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

**Options importantes à comprendre** :
- **`"strict": true`** : Active le mode strict (détection d'erreurs avancée)
- **`"jsx": "react-jsx"`** : Permet l'utilisation de JSX
- **`"include": ["src"]`** : Seuls les fichiers dans `src/` sont compilés

---

### 0.6. Dépendances nécessaires

Vérifie que ton `package.json` contient au minimum :

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5"
  }
}
```

> ⚠️ **Si tu utilises des fonctionnalités spécifiques** (comme des animations), tu devras installer des dépendances supplémentaires.

---

### 0.7. Fichiers de base à comprendre

#### `public/index.html`
C'est le point d'entrée HTML de ton application. **Ne modifie pas** la ligne :
```html
<div id="root"></div>
```
C'est là que React montera ton application.

#### `src/index.tsx`
Point d'entrée TypeScript/React. Contient normalement :
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### `src/App.tsx`
C'est ici que tu vas développer ton jeu Othello.

---

### 0.8. Ajout des déclarations de types pour les fichiers statiques

Pour éviter les erreurs TypeScript lors de l'import de fichiers CSS ou d'images, crée un fichier **`src/declarations.d.ts`** avec le contenu suivant :

```ts
// Déclarations pour les fichiers CSS
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Déclarations pour les images
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Déclarations pour les JSON
declare module "*.json" {
  const value: any;
  export default value;
}
```

> 💡 **Pourquoi ?** : TypeScript ne connaît pas nativement les types des fichiers statiques. Ces déclarations lui indiquent comment les traiter.

---

### 0.9. Démarrage du projet

1. **Installe les dépendances** (si ce n'est pas déjà fait) :
   ```bash
   npm install
   ```

2. **Démarre le serveur de développement** :
   ```bash
   npm start
   ```

3. **Ouvre ton navigateur** à l'adresse [http://localhost:3000](http://localhost:3000)

> ✅ **Ton projet est prêt !** Tu peux maintenant commencer à développer.

---

### 0.10. Résolution des problèmes courants

#### Problème : `Cannot find module './styles.css'`
**Solution** : Crée le fichier `declarations.d.ts` comme expliqué ci-dessus.

#### Problème : `Argument of type 'HTMLElement | null' is not assignable to type 'Container'`
**Solution** : Utilise l'opérateur `!` ou vérifie la présence de l'élément :
```tsx
// Solution 1 (assertion non-null)
const root = createRoot(document.getElementById("root")!);

// Solution 2 (vérification explicite)
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Élément #root introuvable");
const root = createRoot(rootElement);
```

#### Problème : Les modifications ne se répercutent pas
**Solution** : Vérifie que le serveur est bien démarré avec `npm start`. Le rafraîchissement automatique (Hot Reload) devrait fonctionner.

---

## 1. Introduction à React et TypeScript

### Qu'est-ce que React ?
React est une **bibliothèque JavaScript** pour construire des interfaces utilisateur, développée par Facebook. Elle permet de créer des **composants réutilisables** et gère efficacement les mises à jour du DOM grâce au **Virtual DOM**.

### Qu'est-ce que TypeScript ?
TypeScript est un **sur-ensemble typé de JavaScript** développé par Microsoft. Il ajoute :
- **Typage statique** : Détection d'erreurs à la compilation
- **Interfaces** : Définition de la structure des objets
- **Types personnalisés** : Création de types complexes
- **Génériques** : Code réutilisable avec différents types
- **Classes** : Programmation orientée objet avancée

### Avantages de TypeScript avec React :
- **Détection d'erreurs tôt** : Avant l'exécution
- **Meilleure autocomplétion** : IDE plus intelligent
- **Documentation intégrée** : Les types servent de documentation
- **Refactoring facilité** : Changements de code plus sûrs
- **Meilleure maintenabilité** : Code plus compréhensible

---

## 2. Pourquoi TypeScript avec React ?

### Problèmes avec JavaScript pur :
```javascript
// Sans TypeScript, on ne sait pas ce que contient 'props'
function Square(props) {
    // props.value pourrait être n'importe quoi : string, number, object...
    // props.onSquareClick pourrait ne pas être une fonction
    return <button onClick={props.onSquareClick}>{props.value}</button>;
}
```

### Avec TypeScript :
```typescript
interface SquareProps {
    value: 'X' | 'O' | null;
    onSquareClick: () => void;
    isPossibleMove: boolean;
}

function Square({ value, onSquareClick, isPossibleMove }: SquareProps) {
    // On sait exactement ce que chaque prop contient
    // L'IDE propose l'autocomplétion
    // Le compilateur vérifie les types
    return <button onClick={onSquareClick}>{value}</button>;
}
```

### Avantages concrets :
1. **Prévention des erreurs** : Plus de `undefined is not a function`
2. **Meilleure expérience développeur** : Autocomplétion intelligente
3. **Code auto-documenté** : Les types expliquent le code
4. **Refactoring plus sûr** : Changements vérifiés par le compilateur
5. **Collaboration facilitée** : Tout le monde comprend les contrats

---

## 3. Structure du projet Othello en TypeScript

### Architecture des fichiers :
```
myMiniOthello/
├── src/
│   ├── App.tsx          # Logique du jeu (Square, Board, Game) en TypeScript
│   ├── index.tsx         # Point d'entrée en TypeScript
│   └── styles.css       # Styles CSS
└── public/
    └── index.html       # HTML de base
```

### Configuration TypeScript (tsconfig.json) :
```json
{
    "compilerOptions": {
        "target": "ES2020",
        "jsx": "react-jsx",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node"
    },
    "include": ["src"]
}
```

### Flux de données :
```
Game (état typé: history: BoardState[], currentMove: number)
    ↓ (props typés: xIsNext: boolean, squares: BoardState, onPlay: (squares: BoardState) => void)
Board (logique typée: validMoves: number[], currentPlayer: Player)
    ↓ (props typés: value: Pawn, onSquareClick: () => void, isPossibleMove: boolean)
Square (affichage typé)
```

---

## 4. Étapes pour recréer App.tsx de zéro

### Étape 1 : Définir les types
```typescript
// Types de base
export type Pawn = 'X' | 'O' | null;
export type BoardState = Pawn[];  // Tableau de 64 pions
export type Direction = [number, number];  // Tuple pour les directions
export type Player = 'X' | 'O';
```

### Étape 2 : Définir les interfaces
```typescript
interface SquareProps {
    value: Pawn;
    onSquareClick: () => void;
    isPossibleMove: boolean;
}

interface BoardProps {
    xIsNext: boolean;
    squares: BoardState;
    onPlay: (squares: BoardState) => void;
}
```

### Étape 3 : Configuration initiale
```typescript
import { useState } from "react";

// Types exportés pour réutilisation
export type { Pawn, BoardState, Direction, Player };
```

### Étape 4 : Plateau initial
```typescript
const initialBoard: BoardState = Array(64).fill(null);
initialBoard[27] = 'X'; // (3,3)
initialBoard[28] = 'O'; // (3,4)
initialBoard[35] = 'O'; // (4,3)
initialBoard[36] = 'X'; // (4,4)
```

### Étape 5 : État avec useState typé
```typescript
const [history, setHistory] = useState<BoardState[]>([initialBoard]);
const [currentMove, setCurrentMove] = useState<number>(0);
const xIsNext: boolean = currentMove % 2 === 0;
const currentSquares: BoardState = history[currentMove];
```

### Étape 6 : Composant Square avec types
```typescript
function Square({ value, onSquareClick, isPossibleMove }: SquareProps) {
    const hasPawn = value === 'X' || value === 'O';
    const pawnClass = value === 'X' ? 'black-pawn' : value === 'O' ? 'white-pawn' : '';
    return (
        <button
            className={`square ${isPossibleMove ? 'possible-move' : ''}`}
            onClick={onSquareClick}
            aria-label={value === 'X' ? 'black pawn' : value === 'O' ? 'white pawn' : isPossibleMove ? 'possible move' : 'empty square'}
        >
            {hasPawn ? <span className={`pawn ${pawnClass}`.trim()} /> : isPossibleMove && <span className="possible-move-indicator" />}
        </button>
    );
}
```

### Étape 7 : Composant Board avec types
```typescript
function Board({ xIsNext, squares, onPlay }: BoardProps) {
    const directions: Direction[] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, 1],           [0, -1],
        [1, -1],  [1, 0], [1, 1]
    ];
    // Fonctions avec types...
    return <div className="board">{/* plateau */}</div>;
}
```

### Étape 8 : Implémenter la logique avec types
- Toutes les fonctions avec annotations de type

### Étape 9 : Gestion historique typée
- handlePlay, jumpTo avec types

### Étape 10 : Finaliser l'interface
- Composant Game avec types complets

---

## 5. Types TypeScript

### 5.1. Types de base

| Type | Description | Exemple |
|------|-------------|---------|
| `string` | Chaîne de caractères | `type Name = string;` |
| `number` | Nombre | `type Age = number;` |
| `boolean` | Booléen | `type IsActive = boolean;` |
| `null` | Valeur nulle | `type MaybeString = string \| null;` |
| `undefined` | Non défini | `type MaybeNumber = number \| undefined;` |

### 5.2. Types personnalisés (Union Types)

**Syntaxe** :
```typescript
type NomType = Type1 | Type2 | Type3;
```

**Dans le projet** :
```typescript
// Un pion peut être 'X', 'O' ou null
type Pawn = 'X' | 'O' | null;

// Un joueur peut être 'X' ou 'O'
type Player = 'X' | 'O';

// Un plateau est un tableau de 64 pions
type BoardState = Pawn[];
```

### 5.3. Tuples

**Syntaxe** :
```typescript
type NomType = [Type1, Type2];
```

**Dans le projet** :
```typescript
// Une direction est un tuple de deux nombres (delta ligne, delta colonne)
type Direction = [number, number];

// Exemples
const up: Direction = [-1, 0];
const downRight: Direction = [1, 1];
```

### 5.4. Types littéraux

**Syntaxe** :
```typescript
type NomType = 'valeur1' | 'valeur2';
```

**Dans le projet** :
```typescript
type Pawn = 'X' | 'O' | null;  // Types littéraux + null
type Player = 'X' | 'O';
```

### 5.5. Types tableau

**Syntaxe** :
```typescript
type TableauDeType = Type[];
```

**Dans le projet** :
```typescript
type BoardState = Pawn[];  // Tableau de Pawn
type ValidMoves = number[];  // Tableau de nombres
```

### 5.6. Types fonction

**Syntaxe** :
```typescript
type NomType = (param1: Type1, param2: Type2) => ReturnType;
```

**Dans le projet** :
```typescript
// Fonction onPlay qui prend un BoardState et ne retourne rien
type OnPlayFunction = (squares: BoardState) => void;

// Fonction onSquareClick qui ne prend rien et ne retourne rien
type OnSquareClick = () => void;
```

### 5.7. Type any (à éviter)

**À éviter** : `any` désactive la vérification de type
```typescript
// ❌ Mauvaise pratique
let value: any = 'X';
value = 123;  // Pas d'erreur, mais dangereux
```

**À utiliser à la place** :
```typescript
// ✅ Bonne pratique : unknown si le type est vraiment inconnu
let value: unknown = getValue();
if (typeof value === 'string') {
    // value est maintenant de type string
}
```

### 5.8. Type never

**Utilisation** : Pour les fonctions qui ne retournent jamais (lancent toujours une erreur)
```typescript
function throwError(message: string): never {
    throw new Error(message);
}
```

---

## 6. Interfaces TypeScript

### 6.1. Définition d'une interface

**Syntaxe** :
```typescript
interface NomInterface {
    prop1: Type1;
    prop2: Type2;
    propOptionnelle?: Type3;  // Optionnelle
}
```

**Dans le projet** :
```typescript
interface SquareProps {
    value: Pawn;
    onSquareClick: () => void;
    isPossibleMove: boolean;
}

interface BoardProps {
    xIsNext: boolean;
    squares: BoardState;
    onPlay: (squares: BoardState) => void;
}
```

### 6.2. Props optionnelles

**Syntaxe** :
```typescript
interface Props {
    required: string;
    optional?: string;  // Le ? indique optionnel
}
```

**Exemple** :
```typescript
interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;  // Optionnel
    className?: string;  // Optionnel
}
```

### 6.3. Props avec valeur par défaut

**Dans le composant** :
```typescript
function Button({ 
    label, 
    onClick, 
    disabled = false,  // Valeur par défaut
    className = '' 
}: ButtonProps) {
    // disabled et className ont des valeurs par défaut
}
```

### 6.4. Interface vs Type

| | interface | type |
|---|----------|------|
| **Extension** | `extends` | `&` (intersection) |
| **Déclaration multiple** | Oui (fusion) | Non (erreur) |
| **Implémentation** | `implements` | Pas applicable |
| **Compatibilité** | Objets, classes | Tout |

**Exemple avec interface** :
```typescript
interface Person {
    name: string;
    age: number;
}

interface Employee extends Person {
    salary: number;
}
```

**Exemple avec type** :
```typescript
type Person = {
    name: string;
    age: number;
};

type Employee = Person & {
    salary: number;
};
```

**Dans le projet** : On utilise principalement **type** pour les types simples et **interface** pour les props des composants.

---

## 7. Composants React avec TypeScript

### 7.1. Composant avec props typées

**Syntaxe** :
```typescript
interface Props {
    prop1: Type1;
    prop2: Type2;
}

function MonComposant({ prop1, prop2 }: Props) {
    // prop1 et prop2 sont typés
}
```

**Dans le projet** :
```typescript
interface SquareProps {
    value: Pawn;
    onSquareClick: () => void;
    isPossibleMove: boolean;
}

function Square({ value, onSquareClick, isPossibleMove }: SquareProps) {
    // Toutes les props sont typées
}
```

### 7.2. Composant avec children

**Syntaxe** :
```typescript
interface Props {
    children?: React.ReactNode;  // Pour les enfants
}

function Container({ children }: Props) {
    return <div>{children}</div>;
}
```

### 7.3. Composant avec props par défaut

**Syntaxe** :
```typescript
interface Props {
    label: string;
    disabled?: boolean;
}

function Button({ label, disabled = false }: Props) {
    return <button disabled={disabled}>{label}</button>;
}
```

### 7.4. FC (FunctionComponent) explicite

**Syntaxe** :
```typescript
const MonComposant: React.FC<Props> = ({ prop1, prop2 }) => {
    return <div>{prop1}</div>;
};
```

**À noter** : Avec les versions récentes de TypeScript, `React.FC` n'est plus nécessaire. On peut utiliser directement :
```typescript
function MonComposant({ prop1, prop2 }: Props) {
    return <div>{prop1}</div>;
}
```

### 7.5. Composant avec useState typé

**Syntaxe** :
```typescript
const [state, setState] = useState<Type>(initialValue);
```

**Dans le projet** :
```typescript
const [history, setHistory] = useState<BoardState[]>([initialBoard]);
const [currentMove, setCurrentMove] = useState<number>(0);
const [ascending, setAscending] = useState<boolean>(false);
```

### 7.6. Événements typés

**Syntaxe** :
```typescript
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // event est typé
}
```

**Dans le projet** :
```typescript
// Pour les boutons
<button onClick={onSquareClick}>  // onSquareClick: () => void

// Pour les événements avec paramètre
<input onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} />
```

---

## 8. Keywords JavaScript/TypeScript

### 8.1. Variables
| Keyword | Description | Exemple TypeScript |
|---------|-------------|-------------------|
| const | Constante | `const initialBoard: BoardState = Array(64).fill(null);` |
| let | Variable | `let squareIndex: number = -1;` |

### 8.2. Types de données
- `string`: `'X'`, `'Black wins!'`
- `number`: `64`, `0`, `8`, `27`
- `boolean`: `true`, `false`
- `null`: `null`
- `undefined`: `undefined`
- `array`: `BoardState`, `Direction[]`
- `tuple`: `Direction` (ex: `[number, number]`)
- `union`: `Pawn` (ex: `'X' | 'O' | null`)
- `function`: `(squares: BoardState) => void`

### 8.3. Opérateurs TypeScript

**Opérateur d'union** :
```typescript
type Pawn = 'X' | 'O' | null;
```

**Opérateur d'intersection** :
```typescript
type Combined = Type1 & Type2;
```

**Opérateur as (assertion de type)** :
```typescript
const element = document.getElementById('board') as HTMLDivElement;
```

**Opérateur in** :
```typescript
if ('value' in props) {
    // props a une propriété value
}
```

**Opérateur typeof** :
```typescript
if (typeof value === 'string') {
    // value est une string
}
```

**Opérateur instanceof** :
```typescript
if (error instanceof Error) {
    // error est une instance de Error
}
```

### 8.4. Opérateurs JavaScript

**Arithmétiques** : +, -, *, /, %
**Comparaison** : ===, !==, >, <, >=, <=
**Logiques** : &&, \|\|, !
**Ternaire** : condition ? vrai : faux
**Spread** : ...

**Exemples dans le projet** :
```typescript
const row = Math.floor(i / 8);
const col = i % 8;
const currentPlayer: Player = xIsNext ? 'X' : 'O';
const flipped = getFlippedPawns(squares, i, currentPlayer);
```

### 8.5. Structures de contrôle

**if/else, for, for...of, while** : Identiques à JavaScript

**Exemple with type guard** :
```typescript
function processValue(value: string | number) {
    if (typeof value === 'string') {
        // value est de type string ici
        return value.toUpperCase();
    } else {
        // value est de type number ici
        return value.toFixed(2);
    }
}
```

### 8.6. Fonctions

**Fonction typée** :
```typescript
function getPawnCount(squares: BoardState, pawn: Player): number {
    return squares.filter((s: Pawn) => s === pawn).length;
}
```

**Fonction fléchée typée** :
```typescript
const handleClick = (i: number): void => {
    // i est de type number
};
```

**Paramètres optionnels** :
```typescript
function greet(name: string, greeting?: string): string {
    return `${greeting || 'Hello'}, ${name}!`;
}
```

**Paramètres avec valeur par défaut** :
```typescript
function greet(name: string, greeting: string = 'Hello'): string {
    return `${greeting}, ${name}!`;
}
```

**Rest parameters** :
```typescript
function sum(...numbers: number[]): number {
    return numbers.reduce((acc, n) => acc + n, 0);
}
```

### 8.7. Tableaux

**Création typée** :
```typescript
const board: BoardState = Array(64).fill(null);
const directions: Direction[] = [[-1, -1], [-1, 0], ...];
```

**Méthodes typées** :
```typescript
const validMoves: number[] = [];
validMoves.push(27);  // OK
validMoves.push('27');  // ❌ Erreur : Argument de type 'string' n'est pas assignable à 'number'
```

**map typé** :
```typescript
Array(8).fill(null).map((_, rowIndex: number): JSX.Element => (
    <div key={rowIndex}>...</div>
));
```

### 8.8. Objets

**Objet typé** :
```typescript
const person: { name: string; age: number } = {
    name: 'Alice',
    age: 30
};
```

**Accès typé** :
```typescript
person.name;  // string
person.age;   // number
person.email; // ❌ Erreur : La propriété 'email' n'existe pas
```

### 8.9. Immediately Invoked Function Expressions (IIFE)

**Définition** : Une **IIFE** (prononcé "iffy") est une **fonction anonyme qui s'exécute immédiatement après sa déclaration**. C'est un pattern JavaScript qui permet de créer un **scope isolé** pour des variables temporaires.

**Syntaxe** :
```typescript
// Syntaxe de base
(() => {
    // Code ici
})();

// Avec retour de valeur
const result = (() => {
    const temp = 42;
    return temp * 2;
})(); // result = 84

// Avec paramètres
const multiply = ((x: number, y: number) => x * y)(5, 3); // multiply = 15
```

**Pourquoi utiliser une IIFE ?**

| Avantages | Explication | Exemple |
|-----------|-------------|---------|
| **Scope isolé** | Les variables déclarées dans l'IIFE ne "fuitent" pas dans le scope parent | `const board` dans l'exemple ci-dessous |
| **Initialisation complexe** | Permet de créer une valeur avec plusieurs étapes tout en gardant une expression unique | `INITIAL_BOARD` |
| **Éviter la pollution globale** | Protège les variables temporaires | Variables intermédiaires |
| **Expression unique** | Permet de déclarer et initialiser une constante en une seule expression | `const x = (() => { ... })()` |

**Exemple dans le projet : `INITIAL_BOARD`**

Dans `gameConstants.ts`, on utilise une IIFE pour initialiser le plateau initial :

```typescript
export const INITIAL_BOARD: BoardState = (() => {
    const board: BoardState = Array(64).fill(null);
    board[27] = 'X';
    board[28] = 'O';
    board[35] = 'O';
    board[36] = 'X';
    return board;
})();
```

**Pourquoi une IIFE ici ?**

1. **Isolation du scope** :
   - La variable `board` n'existe que dans l'IIFE
   - Elle n'est pas accessible depuis l'extérieur
   - Pas de risque de conflit de noms

2. **Initialisation multi-étapes** :
   - On crée un tableau vide
   - On place les 4 pions centraux
   - On retourne le résultat final
   - Tout cela en **une seule expression** pour l'initialisation de la constante

3. **Équivalent sans IIFE (moins propre)** :
   ```typescript
   // ❌ Moins bon : nécessite une variable globale
   const tempBoard: BoardState = Array(64).fill(null);
   tempBoard[27] = 'X';
   tempBoard[28] = 'O';
   tempBoard[35] = 'O';
   tempBoard[36] = 'X';
   export const INITIAL_BOARD: BoardState = tempBoard;
   
   // ❌ Problème : tempBoard reste accessible et peut être modifiée par erreur
   ```

4. **Autre approche (fonction séparée)** :
   ```typescript
   // ✅ Alternative valable
   function createInitialBoard(): BoardState {
       const board = Array(64).fill(null);
       board[27] = 'X';
       board[28] = 'O';
       board[35] = 'O';
       board[36] = 'X';
       return board;
   }
   export const INITIAL_BOARD: BoardState = createInitialBoard();
   ```

**Cas d'usage courants des IIFE** :

1. **Création de valeurs complexes** :
   ```typescript
   const config = (() => {
       const base = { host: 'localhost', port: 3000 };
       if (process.env.NODE_ENV === 'production') {
           base.host = 'api.example.com';
           base.port = 443;
       }
       return base;
   })();
   ```

2. **Encapsulation de logique** :
   ```typescript
   const result = (() => {
       const data = fetchData();
       const processed = processData(data);
       return formatResult(processed);
   })();
   ```

3. **Pattern Module** (historique, avant ES6 modules) :
   ```typescript
   const myModule = (() => {
       let privateVar = 0;
       return {
           increment: () => privateVar++,
           getValue: () => privateVar
       };
   })();
   ```

**Différence avec une fonction classique** :

| | Fonction classique | IIFE |
|---|-------------------|------|
| **Déclaration** | `function f() {}` | `(function() {})()` |
| **Appel** | `f()` | **Immédiat** à la déclaration |
| **Réutilisation** | Oui, peut être appelée plusieurs fois | Non, s'exécute une seule fois |
| **Scope** | Doit être nommée ou assignée | Anonyme, scope local |
| **Cas d'usage** | Logique réutilisable | Initialisation unique |

**Variantes de syntaxe** :

```typescript
// 1. Avec parenthèses autour de la fonction
(() => {})();

// 2. Avec parenthèses autour de l'appel
(function() {})();

// 3. Avec paramètres
((a: number, b: number) => a + b)(5, 3);

// 4. Avec nom (pour le débogage)
(function namedIIFE() {})();

// 5. Avec retour de valeur assignée
const value = (() => 42)();
```

**Bonnes pratiques** :
- ✅ **Utiliser pour l'initialisation complexe** de constantes
- ✅ **Préférer les noms de fonctions** pour le débogage (ex: `function createInitialBoard() {}`)
- ❌ **Éviter pour la logique principale** (préférer des fonctions nommées)
- ❌ **Ne pas en abuser** (le code doit rester lisible)
- ✅ **Documenter** si la logique est complexe

---

## 9. Keywords React

### 9.1. useState typé

**Syntaxe** :
```typescript
const [state, setState] = useState<Type>(initialValue);
```

**Exemples** :
```typescript
const [history, setHistory] = useState<BoardState[]>([initialBoard]);
const [currentMove, setCurrentMove] = useState<number>(0);
const [ascending, setAscending] = useState<boolean>(false);
```

### 9.2. Composants typés

**Exemple complet** :
```typescript
interface SquareProps {
    value: Pawn;
    onSquareClick: () => void;
    isPossibleMove: boolean;
}

function Square({ value, onSquareClick, isPossibleMove }: SquareProps): JSX.Element {
    return <button onClick={onSquareClick}>{value}</button>;
}
```

### 9.3. Props typées

**Syntaxe** :
```typescript
<Square value={squares[i]} onSquareClick={() => handleClick(i)} isPossibleMove={validMoves.includes(i)} />
```

### 9.4. Événements typés

**Syntaxe** :
```typescript
<button onClick={onSquareClick}>  // onSquareClick: () => void
```

### 9.5. JSX

**Identique à JavaScript**, mais avec types :
```typescript
return (
    <div className="game">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
    </div>
);
```

### 9.6. Rendering conditionnel

**Identique à JavaScript** :
```typescript
{!currentPlayerHasMoves && opponentHasMoves && (
    <button className="pass-button" onClick={handlePass}>Pass Turn</button>
)}
```

### 9.7. Listes et clés

**Avec types** :
```typescript
{moves.map((move: JSX.Element, index: number) => (
    <li key={index}>{move}</li>
))}
```

### 9.8. Export/Import

**Syntaxe** :
```typescript
import { useState } from "react";
import { BoardState, Pawn, Player } from './types';

export default Game;
export type { Pawn, BoardState, Direction, Player };
```

---

## 10. Logique du jeu Othello

### 10.1. Règles complètes du jeu

Othello (aussi appelé Reversi) est un jeu de stratégie pour deux joueurs sur un plateau 8x8. Voici les règles détaillées :

#### 10.1.1. Configuration initiale
- **Plateau** : Grille de 8x8 cases (64 cases au total)
- **Pions** : Deux couleurs : Noir (représenté par `'X'`) et Blanc (représenté par `'O'`)
- **Position de départ** : 4 pions au centre du plateau
  - Case (3,3) = Noir ('X')
  - Case (3,4) = Blanc ('O')
  - Case (4,3) = Blanc ('O')
  - Case (4,4) = Noir ('X')
  - En indices linéaires : 27='X', 28='O', 35='O', 36='X'

#### 10.1.2. Déroulement d'une partie
1. **Tour des joueurs** : Noir ('X') commence toujours la partie
2. **Alternance** : Les joueurs alternent les tours (Noir → Blanc → Noir → ...)
3. **Coup valide** : Un joueur peut poser un pion sur une case vide **uniquement si** ce coup encercle au moins un pion adverse
4. **Retournement** : Tous les pions adverses encerclés par le nouveau pion sont retournés (deviennent la couleur du joueur actuel)
5. **Pass** : Si un joueur n'a aucun coup valide, il doit passer son tour
6. **Fin de partie** : La partie se termine quand les deux joueurs ne peuvent plus jouer

#### 10.1.3. Détermination du gagnant
- **Victoire** : Le joueur avec le plus de pions sur le plateau gagne
- **Égalité** : Si les deux joueurs ont le même nombre de pions
- **Compte des pions** : On compte tous les pions de chaque couleur à la fin de la partie

#### 10.1.4. Cas particuliers
- **Pass successif** : Si un joueur passe, l'autre peut encore jouer s'il a des coups valides
- **Plateau plein** : Si le plateau est complètement rempli, la partie se termine
- **Aucun coup possible** : Si aucun joueur ne peut jouer (même en passant), la partie se termine

---

### 10.2. Système de coordonnées et indexation

#### 10.2.1. Deux systèmes de coordonnées
Le code utilise **deux systèmes** pour représenter les positions :

| Système | Description | Exemple | Utilisation |
|---------|-------------|---------|-------------|
| **2D (ligne, colonne)** | Coordonnées matricielles | (3,4) | Algorithmes de vérification |
| **1D (index linéaire)** | Index de 0 à 63 | 28 | Stockage dans le tableau `squares` |

#### 10.2.2. Conversion entre les systèmes

**Formule pour convertir (ligne, colonne) → index** :
```
index = ligne * 8 + colonne
```

**Formule pour convertir index → (ligne, colonne)** :
```typescript
const row = Math.floor(index / 8);  // Division entière
const col = index % 8;              // Modulo 8
```

#### 10.2.3. Tableau de correspondance

```
Ligne 0:  (0,0)=0  (0,1)=1  (0,2)=2  (0,3)=3  (0,4)=4  (0,5)=5  (0,6)=6  (0,7)=7
Ligne 1:  (1,0)=8  (1,1)=9  (1,2)=10 (1,3)=11 (1,4)=12 (1,5)=13 (1,6)=14 (1,7)=15
Ligne 2:  (2,0)=16 (2,1)=17 (2,2)=18 (2,3)=19 (2,4)=20 (2,5)=21 (2,6)=22 (2,7)=23
Ligne 3:  (3,0)=24 (3,1)=25 (3,2)=26 (3,3)=27 (3,4)=28 (3,5)=29 (3,6)=30 (3,7)=31
Ligne 4:  (4,0)=32 (4,1)=33 (4,2)=34 (4,3)=35 (4,4)=36 (4,5)=37 (4,6)=38 (4,7)=39
Ligne 5:  (5,0)=40 (5,1)=41 (5,2)=42 (5,3)=43 (5,4)=44 (5,5)=45 (5,6)=46 (5,7)=47
Ligne 6:  (6,0)=48 (6,1)=49 (6,2)=50 (6,3)=51 (6,4)=52 (6,5)=53 (6,6)=54 (6,7)=55
Ligne 7:  (7,0)=56 (7,1)=57 (7,2)=58 (7,3)=59 (7,4)=60 (7,5)=61 (7,6)=62 (7,7)=63
```

**Position initiale des 4 pions centraux** :
- (3,3) = index 27 → 'X' (Noir)
- (3,4) = index 28 → 'O' (Blanc)
- (4,3) = index 35 → 'O' (Blanc)
- (4,4) = index 36 → 'X' (Noir)

---

### 10.3. Les 8 directions de vérification

Pour vérifier si un coup est valide et quels pions doivent être retournés, on examine **8 directions** autour de la case jouée :

```typescript
const directions: Direction[] = [
    [-1, -1],  // ⬆️⬅️ Haut-Gauche (diagonale)
    [-1,  0],  // ⬆️ Haut
    [-1,  1],  // ⬆️➡️ Haut-Droite (diagonale)
    [ 0,  1],  // ➡️ Droite
    [ 0, -1],  // ⬅️ Gauche
    [ 1, -1],  // ⬇️⬅️ Bas-Gauche (diagonale)
    [ 1,  0],  // ⬇️ Bas
    [ 1,  1]   // ⬇️➡️ Bas-Droite (diagonale)
];
```

**Représentation visuelle** :
```
   (-1,-1)   (-1,0)   (-1,1)
      ⬆️⬅️      ⬆️       ⬆️➡️
           (0,-1)─(0,0)─(0,1)
              ⬅️    •     ➡️
           (1,-1)  (1,0)  (1,1)
              ⬇️⬅️    ⬇️     ⬇️➡️
```

> 💡 **Pourquoi 8 directions ?** : En Othello, un coup peut encercler des pions adverses dans n'importe quelle direction (y compris les diagonales).

---

### 10.4. Flux de jeu complet

```
┌─────────────────────────────────────────────────────────────┐
│                        DÉBUT DE PARTIE                         │
│  Plateau 8x8 avec 4 pions au centre : X O / O X               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     TOUR DU JOUEUR NOIR (X)                    │
│  1. Vérifier les coups valides pour X                         │
│  2. Si aucun coup valide → PASS                              │
│  3. Sinon :                                                  │
│     a. Joueur place un X sur une case valide                 │
│     b. Retourner tous les O encerclés                       │
│     c. Passer au tour suivant                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TOUR DU JOUEUR BLANC (O)                   │
│  1. Vérifier les coups valides pour O                         │
│  2. Si aucun coup valide → PASS                              │
│  3. Sinon :                                                  │
│     a. Joueur place un O sur une case valide                 │
│     b. Retourner tous les X encerclés                       │
│     c. Passer au tour suivant                                 │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────────────────────┐
              │ FIN DE PARTIE SI :             │
              │ - Plus de cases vides         │
              │ - Aucun joueur ne peut jouer  │
              └───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CALCUL DU SCORE FINAL                     │
│  - Compter les X et les O sur le plateau                     │
│  - Déclarer le gagnant ou l'égalité                         │
└─────────────────────────────────────────────────────────────┘
```

---

### 10.5. Gestion des coups spéciaux

#### 10.5.1. Premier coup du jeu
- **Joueur** : Noir ('X')
- **Coups valides** : Seules les cases adjacentes aux pions blancs (O) peuvent être valides
- **Exemple** : Les cases (2,3), (3,2), (4,5), (5,4) sont des candidats

#### 10.5.2. Passage de tour (PASS)
- **Condition** : Aucun coup valide disponible pour le joueur actuel
- **Effet** : Le tour passe à l'adversaire **sans poser de pion**
- **Cas particulier** : Si les deux joueurs passent successivement, la partie se termine

#### 10.5.3. Coin du plateau
- **Importance stratégique** : Les coins (0,0), (0,7), (7,0), (7,7) sont **très importants**
- **Raison** : Un pion dans un coin ne peut **jamais être retourné** (pas de case derrière)
- **Conséquence** : Si un joueur occupe un coin, tous les pions sur les bords adjacents peuvent potentiellement être retournés en sa faveur

---

### 10.6. Stratégies de base (pour référence)

Bien que l'implémentation ne nécessite pas de comprendre les stratégies, voici quelques concepts utiles :

1. **Contrôle des coins** : Priorité absolue pour occuper les coins
2. **Stabilité des bords** : Éviter de jouer sur les bords (sauf pour contrôler les coins)
3. **Mobilité** : Avoir le plus de coups valides possibles
4. **Parité** : Dans les parties avancées, le dernier joueur à poser un pion peut avoir un avantage

> ⚠️ **À noter** : Ces stratégies ne sont pas implémentées dans le code. Elles sont là pour ta compréhension du jeu.

---

### 10.7. Diagramme d'un coup valide

**Situation** : Plateau partiel avec quelques pions
```
  0 1 2 3 4 5 6 7
 +-----------------+
0| . . . . . . . . |
1| . . . . . . . . |
2| . . . . . . . . |
3| . . . X O . . . |  ← Ligne 3
4| . . . O X . . . |  ← Ligne 4 (X veut jouer en (3,2))
5| . . . . . . . . |
6| . . . . . . . . |
7| . . . . . . . . |
 +-----------------+
```

**Joueur actuel** : Noir (X)
**Coup proposé** : (3,2) - index 26

**Vérification** :
1. Case (3,2) est vide → ✅
2. Vérifier dans toutes les directions :
   - **Haut** : (2,2) → vide → ❌
   - **Bas** : (4,2) → O, (5,2) → vide → ❌
   - **Gauche** : (3,1) → vide → ❌
   - **Droite** : (3,3) → X → ❌ (pas de O à retourner)
   - **Haut-Gauche** : (2,1) → vide → ❌
   - **Haut-Droite** : (2,3) → vide → ❌
   - **Bas-Gauche** : (4,1) → vide → ❌
   - **Bas-Droite** : (4,3) → O, (5,4) → vide → ❌

**Résultat** : Aucune direction ne permet d'encerclement → **Coup INVALIDE** ❌

---

**Autre exemple** : Coup valide en (2,3)
```
  0 1 2 3 4 5 6 7
 +-----------------+
0| . . . . . . . . |
1| . . . . . . . . |
2| . . X O . . . . |  ← Ligne 2 (X veut jouer en (2,3))
3| . . . X O . . . |  ← Ligne 3
4| . . . O X . . . |  ← Ligne 4
5| . . . . . . . . |
 +-----------------+
```

**Vérification direction Bas** :
- (2,3) → vide (coup proposé)
- (3,3) → X (notre pion) → ❌ Pas de O à retourner dans cette direction

**Vérification direction Bas-Droite** :
- (2,3) → vide (coup proposé)
- (3,4) → O (pion adverse)
- (4,5) → vide → ❌ Pas de X à la fin

**Vérification direction Droite** :
- (2,3) → vide (coup proposé)
- (2,4) → vide → ❌

**Vérification direction Haut-Droite** :
- (2,3) → vide (coup proposé)
- (1,4) → vide → ❌

**Coup INVALIDE** car aucune direction ne contient une séquence O...O entre X et le coup proposé.

---

**Exemple de coup VALIDE** :
```
  0 1 2 3 4 5
 +----------+
0| . . . . . |
1| . . O O . |
2| . X O X . |  ← X joue en (2,1)
3| . . O . . |
4| . . . . . |
 +----------+
```

**Vérification direction Droite** :
- (2,1) → vide (coup proposé)
- (2,2) → O (adverse)
- (2,3) → X (notre pion) → ✅ **Encerclage valide !**

**Pions à retourner** : (2,2) → index 18

**Vérification direction Bas-Droite** :
- (2,1) → vide
- (3,2) → O (adverse)
- (4,3) → vide → ❌

**Coup VALIDE** ✅ avec retournement du pion en (2,2)

---

### 10.8. Résumé visuel des concepts clés

```
┌─────────────────────────────────────────────────────────────┐
│  CONCEPT                | SYMBOLE | VALEUR | RÔLE                      │
├─────────────────────────────────────────────────────────────┤
│  Case vide             | .       | null   | Peut recevoir un pion      │
│  Pion Noir             | X       | 'X'    | Joueur 1, commence          │
│  Pion Blanc            | O       | 'O'    | Joueur 2                  │
│  Plateau               | BoardState | Pawn[] | Tableau de 64 cases        │
│  Coup valide           | ✅      | true   | Peut être joué             │
│  Coup invalide         | ❌      | false  | Ne peut pas être joué      │
│  Pion à retourner       | ⬅️/➡️  | -      | Change de couleur          │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Algorithmes expliqués en détail

Cette section détaille **chaque algorithme** du jeu Othello, avec :
- **Le rôle** de la fonction
- **Le flux pas à pas**
- **Des exemples concrets**
- **Les erreurs courantes** à éviter
- **Des diagrammes visuels**

---

### 11.1. Fonctions utilitaires de base

#### 11.1.1. isOnBoard(row, col)

**Rôle** : Vérifie si une position (ligne, colonne) est **dans les limites** du plateau 8x8.

**Code** :
```typescript
function isOnBoard(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}
```

**Explication pas à pas** :
1. `row >= 0` : Vérifie que la ligne n'est pas au-dessus du plateau
2. `row < 8` : Vérifie que la ligne n'est pas en dessous du plateau
3. `col >= 0` : Vérifie que la colonne n'est pas à gauche du plateau
4. `col < 8` : Vérifie que la colonne n'est pas à droite du plateau

**Retourne** : `true` si la position est valide, `false` sinon.

**Exemples** :
```
isOnBoard(0, 0)   → true   ✅ (coin supérieur gauche)
isOnBoard(7, 7)   → true   ✅ (coin inférieur droit)
isOnBoard(3, 4)   → true   ✅ (centre)
isOnBoard(-1, 5)  → false  ❌ (hors plateau, ligne négative)
isOnBoard(8, 3)   → false  ❌ (hors plateau, ligne trop grande)
isOnBoard(2, 8)   → false  ❌ (hors plateau, colonne trop grande)
```

**Utilisation** : Appelée **des dizaines de fois** par `getFlippedPawns` pour éviter les erreurs d'index.

---

#### 11.1.2. getPawnCount(squares, pawn)

**Rôle** : Compte le nombre de pions d'un joueur donné sur le plateau.

**Code** :
```typescript
function getPawnCount(squares: BoardState, pawn: Player): number {
    return squares.filter((s: Pawn) => s === pawn).length;
}
```

**Explication pas à pas** :
1. `squares.filter(...)` : Crée un nouveau tableau avec seulement les cases qui correspondent au critère
2. `(s: Pawn) => s === pawn` : Garde seulement les cases qui contiennent le pion du joueur (`'X'` ou `'O'`)
3. `.length` : Retourne la taille du tableau filtré = nombre de pions

**Exemple** :
```typescript
const board: BoardState = [
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    null, null, 'X', 'O', null, null, null, null,
    null, null, 'O', 'X', null, null, null, null,
    ... // reste du plateau
];

getPawnCount(board, 'X')  // → 2 (il y a 2 X sur le plateau)
getPawnCount(board, 'O')  // → 2 (il y a 2 O sur le plateau)
```

**Complexité** : O(n) où n = 64 (taille du plateau). Très rapide.

---

### 11.2. L'algorithme cœur : getFlippedPawns

**⭐ L'algorithme le plus important du jeu !**

**Rôle** : Trouve **tous les pions adverses** qui seraient retournés si on joue à la position `i`.

**Code complet** :
```typescript
function getFlippedPawns(squares: BoardState, i: number, currentPlayer: Player): number[] {
    const flipped: number[] = [];              // Tableau des pions à retourner
    const row = Math.floor(i / 8);           // Ligne de la case jouée
    const col = i % 8;                       // Colonne de la case jouée
    const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';  // Pion adverse

    // Parcourir toutes les 8 directions
    for (const [dr, dc] of directions) {
        let r = row + dr;  // Position initiale dans la direction
        let c = col + dc;
        let toFlipInDirection: number[] = [];  // Pions à retourner dans cette direction

        // Avancer dans la direction tant qu'on trouve des pions adverses
        while (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
            toFlipInDirection.push(r * 8 + c);  // Ajouter l'index à retourner
            r += dr;  // Avancer d'une case dans la direction
            c += dc;
        }

        // Si on trouve un pion du joueur actuel à la fin de la séquence
        if (isOnBoard(r, c) && squares[r * 8 + c] === currentPlayer) {
            flipped.push(...toFlipInDirection);  // Ajouter tous les pions de cette direction
        }
    }

    return flipped;  // Retourner tous les index à retourner
}
```

---

#### 11.2.1. Explication pas à pas de getFlippedPawns

**Étape 1 : Initialisation**
```typescript
const flipped: number[] = [];
const row = Math.floor(i / 8);    // Ex: i=26 → row=3, col=2
const col = i % 8;
const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';
```
- `flipped` : Tableau vide qui va contenir les index des pions à retourner
- `row`, `col` : Conversion de l'index linéaire en coordonnées 2D
- `opponent` : Le pion adverse ('O' si currentPlayer='X', et vice versa)

**Étape 2 : Boucle sur les 8 directions**
```typescript
for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    let toFlipInDirection: number[] = [];
```
- Pour chaque direction (ex: `[-1, 0]` = Haut), on initialise :
  - `r`, `c` : Position de la première case dans cette direction
  - `toFlipInDirection` : Tableau temporaire pour cette direction

**Étape 3 : Avancer dans la direction (boucle while)**
```typescript
while (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
    toFlipInDirection.push(r * 8 + c);
    r += dr;
    c += dc;
}
```
- **Tant que** :
  - On est toujours sur le plateau (`isOnBoard(r, c)`)
  - ET la case contient un pion adverse (`squares[...] === opponent`)
- **Faire** :
  - Ajouter l'index de cette case à `toFlipInDirection`
  - Avancer d'une case dans la direction (`r += dr`, `c += dc`)

**Étape 4 : Vérifier la fin de la séquence**
```typescript
if (isOnBoard(r, c) && squares[r * 8 + c] === currentPlayer) {
    flipped.push(...toFlipInDirection);
}
```
- Après avoir terminé la boucle while, on vérifie la case **suivante** :
  - Si elle est sur le plateau (`isOnBoard(r, c)`)
  - ET qu'elle contient un pion du joueur actuel (`squares[...] === currentPlayer`)
- **Alors** : Tous les pions dans `toFlipInDirection` sont **valides à retourner**

---

#### 11.2.2. Exemple visuel complet

**Plateau initial** (simplifié 5x5) :
```
  0 1 2 3 4
 +---------+
0| . . . . . |
1| . . . . . |
2| . . X O . |  ← X veut jouer en (1,2)
3| . O O X . |
4| . . . . . |
 +---------+
```

**Appel** : `getFlippedPawns(squares, 6, 'X')` (index 6 = (1,2))

**Étapes** :

1. **Direction Haut ([-1, 0])** :
   - (1,2) → (0,2) → vide → **Aucun pion à retourner**

2. **Direction Haut-Droite ([-1, 1])** :
   - (1,2) → (0,3) → vide → **Aucun pion à retourner**

3. **Direction Droite ([0, 1])** :
   - (1,2) → (1,3) → vide → **Aucun pion à retourner**

4. **Direction Bas-Droite ([1, 1])** :
   - (1,2) → (2,3) → O (adverse) → Ajouter 19
   - (3,4) → vide → **Séquence terminée sans X à la fin** → **Aucun pion à retourner**

5. **Direction Bas ([1, 0])** :
   - (1,2) → (2,2) → X (notre pion) → **Séquence vide** → **Aucun pion à retourner**

6. **Direction Bas-Gauche ([1, -1])** :
   - (1,2) → (2,1) → O (adverse) → Ajouter 17
   - (3,0) → vide → **Séquence terminée sans X à la fin** → **Aucun pion à retourner**

7. **Direction Gauche ([0, -1])** :
   - (1,2) → (1,1) → O (adverse) → Ajouter 5
   - (1,0) → vide → **Séquence terminée sans X à la fin** → **Aucun pion à retourner**

8. **Direction Haut-Gauche ([-1, -1])** :
   - (1,2) → (0,1) → vide → **Aucun pion à retourner**

**Résultat** : `[]` (aucun pion à retourner) → **Coup INVALIDE** ❌

---

**Autre exemple avec encerclement invalide** :

**Plateau** :
```
  0 1 2 3 4
 +---------+
0| . . . . . |
1| . X O . . |  ← X joue en (1,0)
2| X O O X . |
3| . . . . . |
 +---------+
```

**Appel** : `getFlippedPawns(squares, 8, 'X')` (index 8 = (1,0))

**Direction Droite ([0, 1])** :
- (1,0) → (1,1) → X (notre pion) → **Séquence vide** → **Aucun pion**

**Direction Bas-Droite ([1, 1])** :
- (1,0) → (2,1) → O (adverse) → Ajouter 17
- (3,2) → vide → **Séquence terminée sans X** → **Aucun pion**

**Direction Bas ([1, 0])** :
- (1,0) → (2,0) → X (notre pion) → **Séquence vide** → **Aucun pion**

**Direction Bas-Gauche ([1, -1])** : ❌ (hors plateau)

**Direction Gauche ([0, -1])** : ❌ (hors plateau)

**Direction Haut-Gauche ([-1, -1])** : ❌ (hors plateau)

**Direction Haut ([-1, 0])** :
- (1,0) → (0,0) → vide → **Aucun pion**

**Direction Haut-Droite ([-1, 1])** :
- (1,0) → (0,1) → vide → **Aucun pion**

**Résultat** : `[]` → **Coup INVALIDE** ❌

---

**Exemple INVALIDE** :

**Plateau** :
```
  0 1 2 3
 +-------+
0| . . . . |
1| . X O . |  ← X joue en (1,1) - index 5
2| . O X . |
3| . . . . |
 +-------+
```

**Appel** : `getFlippedPawns(squares, 5, 'X')`

**Direction Bas ([1, 0])** :
- (1,1) → (2,1) → O (adverse) → Ajouter 10
- (3,1) → vide → **Terminé sans X** → **Aucun pion**

**Direction Droite ([0, 1])** :
- (1,1) → (1,2) → O (adverse) → Ajouter 6
- (1,3) → vide → **Terminé sans X** → **Aucun pion**

**Direction Bas-Droite ([1, 1])** :
- (1,1) → (2,2) → X (notre pion) → **Séquence vide** → **Aucun pion**

**Résultat** : `[]` → **Coup INVALIDE** ❌

> ⚠️ **Remarque** : Ce coup semble valide visuellement, mais en réalité, les pions O en (1,2) et (2,1) ne sont **pas encerclés** car il n'y a pas de X à la fin de chaque séquence. Il faut une **séquence complète** : X ... O O O ... X

---

**Encore un exemple INVALIDE** :

**Plateau** :
```
  0 1 2 3
 +-------+
0| . . . . |
1| X O O . |  ← X joue en (1,0) - index 4
2| . . X . |
 +-------+
```

**Appel** : `getFlippedPawns(squares, 4, 'X')`

**Direction Droite ([0, 1])** :
- (1,0) → (1,1) → O (adverse) → Ajouter 5
- (1,2) → O (adverse) → Ajouter 6
- (1,3) → vide → **Terminé sans X** → **Aucun pion**

**Direction Bas-Droite ([1, 1])** :
- (1,0) → (2,1) → vide → **Aucun pion**

**Direction Bas ([1, 0])** :
- (1,0) → (2,0) → vide → **Aucun pion**

**Résultat** : `[]` → **Coup INVALIDE** ❌

> 💡 **Attention** : Il faut que la séquence **commence et termine par un pion du joueur actuel** avec des pions adverses entre les deux !

---

**Coup VALIDE** :

**Plateau** :
```
  0 1 2 3
 +-------+
0| . . . . |
1| X O O X |  ← X joue en (1,0) - index 4
2| . . . . |
 +-------+
```

**Appel** : `getFlippedPawns(squares, 4, 'X')`

**Direction Droite ([0, 1])** :
- (1,0) → (1,1) → O (adverse) → Ajouter 5
- (1,2) → O (adverse) → Ajouter 6
- (1,3) → X (notre pion) → **Séquence valide !** ✅
- **Pions à retourner** : [5, 6] → indices des O en (1,1) et (1,2)

**Résultat** : `[5, 6]` → **Coup VALIDE** ✅ avec 2 pions à retourner

---

#### 11.2.3. Diagramme de flux de getFlippedPawns

```
┌─────────────────────────────────────────────────────────────┐
│                    getFlippedPawns(squares, i, currentPlayer)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Initialisation                                             │
│     - row = Math.floor(i / 8)                                  │
│     - col = i % 8                                             │
│     - opponent = (currentPlayer === 'X') ? 'O' : 'X'          │
│     - flipped = []                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Pour chaque direction [dr, dc] dans directions             │
│     ┌─────────────────────────────────────────────────────────┐│
│     │  a. Initialisation direction                            ││
│     │     - r = row + dr, c = col + dc                         ││
│     │     - toFlipInDirection = []                             ││
│     └─────────────────────────────────────────────────────────┘
│                              │                                  │
│                              ▼                                  │
│     ┌─────────────────────────────────────────────────────────┐│
│     │  b. Tant que (while) :                                   ││
│     │     - isOnBoard(r, c) EST VRAI                           ││
│     │     - ET squares[r*8+c] === opponent                      ││
│     │     → Ajouter r*8+c à toFlipInDirection                  ││
│     │     → r += dr, c += dc                                   ││
│     └─────────────────────────────────────────────────────────┘
│                              │                                  │
│                              ▼                                  │
│     ┌─────────────────────────────────────────────────────────┐│
│     │  c. Si (if) :                                            ││
│     │     - isOnBoard(r, c) EST VRAI                           ││
│     │     - ET squares[r*8+c] === currentPlayer                ││
│     │     → Ajouter tous les éléments de toFlipInDirection     ││
│     │        à flipped                                         ││
│     └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Retourner flipped                                         │
└─────────────────────────────────────────────────────────────┘
```

---

#### 11.2.4. Erreurs courantes dans getFlippedPawns

| Erreur | Conséquence | Solution |
|--------|-------------|----------|
| Oublier `isOnBoard(r, c)` dans la boucle while | Accès hors tableau → crash | Toujours vérifier les limites |
| Ne pas vérifier `squares[r*8+c] === opponent` | Compte des cases vides ou de sa couleur | Vérifier que c'est bien un pion adverse |
| Ne pas vérifier `squares[r*8+c] === currentPlayer` à la fin | Retourne des pions non encerclés | Vérifier que la séquence se termine par notre pion |
| Utiliser `squares.length` au lieu de 8 | Ne fonctionne pas pour un plateau 8x8 | Toujours utiliser 8 pour Othello |
| Oublier de convertir (r,c) en index | Erreur de calcul | Toujours utiliser `r * 8 + c` |

---

### 11.3. Vérification des coups : isValidMove

**Rôle** : Vérifie si un coup à la position `i` est **valide** pour le joueur actuel.

**Code** :
```typescript
function isValidMove(squares: BoardState, i: number, currentPlayer: Player): boolean {
    // 1. La case doit être vide
    if (squares[i] !== null) return false;
    
    // 2. Le coup doit permettre de retourner au moins un pion
    return getFlippedPawns(squares, i, currentPlayer).length > 0;
}
```

---

#### 11.3.1. Logique pas à pas

1. **Vérification de la case vide** :
   ```typescript
   if (squares[i] !== null) return false;
   ```
   - Si la case contient déjà un pion (`'X'` ou `'O'`), le coup est **invalide**
   - Retourne `false` immédiatement

2. **Vérification du retournement** :
   ```typescript
   return getFlippedPawns(squares, i, currentPlayer).length > 0;
   ```
   - Appelle `getFlippedPawns` pour savoir quels pions seraient retournés
   - Si le tableau retourné a une **longueur > 0**, alors au moins un pion serait retourné
   - Donc le coup est **valide** → retourne `true`

---

#### 11.3.2. Exemple

**Plateau** :
```
  0 1 2 3
 +-------+
0| X O O X |  ← X veut jouer en (0,0) - déjà occupé
1| . . . . |
 +-------+
```

**Appel** : `isValidMove(squares, 0, 'X')`
- `squares[0] === 'X'` → pas null → **Retourne false** ❌

**Autre exemple** :
```
  0 1 2 3
 +-------+
0| . . . . |
1| X O O X |  ← X veut jouer en (1,0) - index 4
 +-------+
```

**Appel** : `isValidMove(squares, 4, 'X')`
- `squares[4] === null` → case vide → ✅
- `getFlippedPawns(squares, 4, 'X')` → `[5, 6]` (longueur 2 > 0) → **Retourne true** ✅

---

### 11.4. Vérification globale : hasValidMoves

**Rôle** : Vérifie si un joueur a **au moins un coup valide** sur l'ensemble du plateau.

**Code** :
```typescript
function hasValidMoves(squares: BoardState, currentPlayer: Player): boolean {
    for (let i = 0; i < squares.length; i++) {
        if (isValidMove(squares, i, currentPlayer)) {
            return true;
        }
    }
    return false;
}
```

---

#### 11.4.1. Logique pas à pas

1. **Boucle sur toutes les cases** :
   ```typescript
   for (let i = 0; i < squares.length; i++) {
   ```
   - `squares.length` = 64 (taille du plateau)
   - On vérifie chaque case une par une

2. **Vérification individuelle** :
   ```typescript
   if (isValidMove(squares, i, currentPlayer)) {
       return true;
   }
   ```
   - Si on trouve **une seule** case valide, on retourne `true` immédiatement
   - Pas besoin de vérifier les autres cases (optimisation)

3. **Aucun coup valide** :
   ```typescript
   return false;
   ```
   - Si la boucle termine sans trouver de coup valide, retourne `false`

---

#### 11.4.2. Optimisation possible

**Version optimisée** (évite de vérifier les cases occupées) :
```typescript
function hasValidMoves(squares: BoardState, currentPlayer: Player): boolean {
    for (let i = 0; i < squares.length; i++) {
        // Vérifier d'abord si la case est vide
        if (squares[i] === null && isValidMove(squares, i, currentPlayer)) {
            return true;
        }
    }
    return false;
}
```
> ⚡ **Pourquoi ?** : On évite d'appeler `isValidMove` pour les cases déjà occupées (qui retourneraient `false` immédiatement de toute façon).

---

#### 11.4.3. Utilisation dans le jeu

`hasValidMoves` est utilisée pour :
1. **Savoir si un joueur peut jouer** :
   ```typescript
   const currentPlayerHasMoves = hasValidMoves(squares, currentPlayer);
   ```
2. **Gérer le passage de tour** :
   ```typescript
   if (!currentPlayerHasMoves) {
       // Le joueur doit passer
   }
   ```
3. **Détecter la fin de partie** :
   ```typescript
   const opponentHasMoves = hasValidMoves(squares, opponent);
   if (!currentPlayerHasMoves && !opponentHasMoves) {
       // Fin de partie
   }
   ```

---

### 11.5. Application du retournement : flipPawn

**Rôle** : **Retourne effectivement** les pions encerclés après un coup valide.

**Code** :
```typescript
function flipPawn(nextSquares: BoardState, i: number, currentPlayer: Player): boolean {
    const flipped = getFlippedPawns(nextSquares, i, currentPlayer);
    for (const index of flipped) {
        nextSquares[index] = currentPlayer;
    }
    return flipped.length > 0;
}
```

---

#### 11.5.1. Logique pas à pas

1. **Récupérer les pions à retourner** :
   ```typescript
   const flipped = getFlippedPawns(nextSquares, i, currentPlayer);
   ```
   - Appelle `getFlippedPawns` pour obtenir la liste des index à retourner

2. **Changer la couleur des pions** :
   ```typescript
   for (const index of flipped) {
       nextSquares[index] = currentPlayer;
   }
   ```
   - Pour chaque index dans `flipped`, on **remplace** le pion adverse par celui du joueur actuel

3. **Retourner un booléen** :
   ```typescript
   return flipped.length > 0;
   ```
   - Retourne `true` si au moins un pion a été retourné
   - Retourne `false` si aucun pion n'a été retourné (coup invalide, ne devrait pas arriver)

---

#### 11.5.2. Pourquoi modifier nextSquares et pas squares ?

```typescript
// ❌ MAUVAIS - Modifie l'état directement
function flipPawn(squares: BoardState, i: number, currentPlayer: Player): boolean {
    const flipped = getFlippedPawns(squares, i, currentPlayer);
    for (const index of flipped) {
        squares[index] = currentPlayer;  // ❌ Modifie l'état actuel !
    }
    return flipped.length > 0;
}

// ✅ BON - Modifie une copie
function flipPawn(nextSquares: BoardState, i: number, currentPlayer: Player): boolean {
    const flipped = getFlippedPawns(nextSquares, i, currentPlayer);
    for (const index of flipped) {
        nextSquares[index] = currentPlayer;  // ✅ Modifie la copie
    }
    return flipped.length > 0;
}
```

**Explication** :
- En React, **on ne modifie jamais l'état directement**
- `squares` est l'état actuel (immuable)
- `nextSquares` est une **copie** (`squares.slice()`) que l'on modifie avant de mettre à jour l'état
- Cela permet à React de **détecter les changements** et de mettre à jour l'interface

---

### 11.6. Gestion du clic : handleClick

**Rôle** : Gère l'action lorsqu'un joueur clique sur une case du plateau.

**Code** :
```typescript
function handleClick(i: number): void {
    // 1. Vérifier que la case n'est pas déjà occupée
    if (squares[i] !== null) return;
    
    // 2. Déterminer le joueur actuel
    const currentPlayer: Player = xIsNext ? 'X' : 'O';
    
    // 3. Vérifier que le coup est valide
    if (!isValidMove(squares, i, currentPlayer)) return;
    
    // 4. Créer une copie du plateau
    const nextSquares: BoardState = squares.slice();
    
    // 5. Placer le nouveau pion
    nextSquares[i] = currentPlayer;
    
    // 6. Retourner les pions encerclés
    const flipped = flipPawn(nextSquares, i, currentPlayer);
    
    // 7. Vérifier que des pions ont été retournés
    if (!flipped) return;
    
    // 8. Notifier le parent (Game) du nouveau plateau
    onPlay(nextSquares);
}
```

---

#### 11.6.1. Flux complet de handleClick

```
┌─────────────────────────────────────────────────────────────┐
│                    handleClick(i)                             │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────────────────────┐
              │ squares[i] !== null ?          │
              │   → Case occupée              │
              └─────────────────┬─────────────┘
                            Yes │ No
                                 ▼
              ┌───────────────────────────────┐
              │ RETURN (ne rien faire)          │
              └───────────────────────────────┘
                                 │
              ┌───────────────────────────────┐
              │ currentPlayer = xIsNext ?      │
              │   'X' : 'O'                    │
              └─────────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ isValidMove(squares, i,       │
              │   currentPlayer) ?             │
              └─────────────────┬─────────────┘
                            Yes │ No
                                 ▼
              ┌───────────────────────────────┐
              │ RETURN (coup invalide)          │
              └───────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ nextSquares = squares.slice()  │
              └───────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ nextSquares[i] = currentPlayer │
              │   (placer le nouveau pion)      │
              └───────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ flipped = flipPawn(...)        │
              │   (retourner les pions)        │
              └───────────────────────────────┘
                            │
              ┌───────────────────────────────┐
              │ flipped ?                      │
              └─────────────────┬─────────────┘
                            Yes │ No
                                 ▼
              ┌───────────────────────────────┐
              │ RETURN (aucun pion retourné)   │
              └───────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ onPlay(nextSquares)            │
              │   (mettre à jour l'état parent)│
              └───────────────────────────────┘
```

---

#### 11.6.2. Points clés de handleClick

| Étape | Action | Pourquoi c'est important |
|-------|--------|--------------------------|
| 1 | Vérifier case vide | On ne peut pas jouer sur une case occupée |
| 2 | Déterminer currentPlayer | Savoir de quel joueur il s'agit |
| 3 | Vérifier validité | Respecter les règles d'Othello |
| 4 | Créer une copie | Ne pas modifier l'état directement (principe d'immuabilité) |
| 5 | Placer le pion | Ajouter le nouveau pion du joueur |
| 6 | Retourner les pions | Appliquer les règles d'encerclement |
| 7 | Vérifier retournement | Sécurité : ne pas accepter un coup sans retournement |
| 8 | Notifier parent | Mettre à jour l'état global du jeu |

---

### 11.7. Gestion de l'historique : handlePlay et jumpTo

#### 11.7.1. handlePlay(nextSquares)

**Rôle** : Met à jour l'historique des coups après qu'un joueur ait joué.

**Code** :
```typescript
function handlePlay(nextSquares: BoardState): void {
    // 1. Conserver l'historique jusqu'au coup actuel
    // 2. Ajouter le nouveau plateau
    const nextHistory: BoardState[] = [...history.slice(0, currentMove + 1), nextSquares];
    
    // 3. Mettre à jour l'historique
    setHistory(nextHistory);
    
    // 4. Mettre à jour l'index du coup actuel
    setCurrentMove(nextHistory.length - 1);
}
```

---

##### 11.7.1.1. Pourquoi `history.slice(0, currentMove + 1)` ?

**Explication** :
```typescript
// Exemple :
// history = [board0, board1, board2, board3, board4]
// currentMove = 2 (on est au coup 2)

// Si le joueur joue un nouveau coup :
// nextHistory = [...history.slice(0, 3), nextSquares]
//            = [board0, board1, board2, nextSquares]

// Si on avait fait :
// nextHistory = [...history, nextSquares]
//            = [board0, board1, board2, board3, board4, nextSquares]
// On aurait gardé les coups 3 et 4 qui n'existent plus !
```

**Cas d'usage** :
1. Le joueur fait les coups : 0 → 1 → 2 → 3 → 4
2. Le joueur **revient en arrière** au coup 2
3. Le joueur fait un **nouveau coup** à partir du coup 2
4. **Résultat attendu** : [0, 1, 2, nouveau_coup] (les coups 3 et 4 sont abandonnés)
5. **Sans slice** : [0, 1, 2, 3, 4, nouveau_coup] ❌ (garde l'ancien futur)

---

##### 11.7.1.2. Pourquoi `currentMove + 1` ?

- `currentMove` est l'**index** du coup actuel (0-indexé)
- `history.slice(0, currentMove + 1)` garde tous les coups **jusqu'à et incluant** `currentMove`
- Exemple : Si `currentMove = 2`, on garde `history[0]`, `history[1]`, `history[2]`

---

#### 11.7.2. jumpTo(nextMove)

**Rôle** : Permet de **revenir à un coup précédent** dans l'historique.

**Code** :
```typescript
function jumpTo(nextMove: number): void {
    setCurrentMove(nextMove);
}
```

**Explication** :
- Met simplement à jour `currentMove` avec la valeur `nextMove`
- React **re-rend** le composant avec le nouvel état
- Le plateau affiché sera `history[nextMove]`

---

##### 11.7.2.1. Exemple d'utilisation

```typescript
// Dans le composant Game :
const moves = history.map((squares, move) => {
    const desc = move > 0 ? `Go to move #${move}` : 'Go to game start';
    return (
        <li key={move}>
            <button onClick={() => jumpTo(move)}>{desc}</button>
        </li>
    );
});
```

- Chaque bouton de l'historique appelle `jumpTo` avec son index
- Quand on clique sur "Go to move #2", `jumpTo(2)` est appelé
- `currentMove` devient 2, donc `currentSquares = history[2]`

---

### 11.8. Génération de l'historique : moves

**Rôle** : Génère la liste des coups pour l'interface, avec une description pour chaque coup.

**Code** :
```typescript
const moves = history.map((squares: BoardState, move: number): JSX.Element => {
    let description: string;
    
    if (move > 0) {
        // Trouver la case jouée par rapport au coup précédent
        const prevSquares: BoardState = history[move - 1];
        let squareIndex: number = -1;
        
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== prevSquares[i]) {
                squareIndex = i;
                break;
            }
        }
        
        // Convertir l'index en coordonnées lisibles (1-indexé)
        const rowIndex: number = Math.floor(squareIndex / 8) + 1;
        const colIndex: number = squareIndex % 8 + 1;
        
        // Déterminer quel joueur a joué
        const player = move % 2 === 0 ? "Black" : "White";
        
        description = `#${move} ${player} played [${rowIndex}, ${colIndex}]`;
    } else {
        // Premier coup : retour au début
        description = "Go to game start";
    }
    
    return (
        <li key={move}>
            <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
    );
});
```

---

#### 11.8.1. Logique pas à pas

1. **Pour chaque coup dans l'historique** (`history.map`)
2. **Si c'est le premier coup** (`move === 0`) :
   - Description = "Go to game start"
3. **Sinon** :
   a. Récupérer le plateau précédent (`history[move - 1]`)
   b. **Trouver la différence** : Boucle pour trouver la case qui a changé
   c. **Convertir l'index** en coordonnées (ligne, colonne) **1-indexées** (plus lisibles)
   d. **Déterminer le joueur** : Les coups pairs (0, 2, 4...) sont Noir (Black), les impairs sont Blanc (White)
   e. Créer la description : `#2 Black played [4, 5]`
4. **Rendre le bouton** avec la description et l'action `jumpTo(move)`

---

#### 11.8.2. Pourquoi +1 pour les coordonnées ?

```typescript
// Index 0-based (utilisé en interne) :
// (0,0) (0,1) (0,2) ...
// (1,0) (1,1) (1,2) ...

// Affichage 1-based (plus naturel pour les humains) :
// [1,1] [1,2] [1,3] ...
// [2,1] [2,2] [2,3] ...

const rowIndex = Math.floor(squareIndex / 8) + 1;  // +1 pour passer en 1-based
const colIndex = squareIndex % 8 + 1;            // +1 pour passer en 1-based
```

---

#### 11.8.3. Pourquoi `move % 2 === 0` pour Black ?

- **move = 0** (premier coup) : Noir commence → `0 % 2 === 0` → Black ✅
- **move = 1** : Blanc → `1 % 2 === 1` → White ✅
- **move = 2** : Noir → `2 % 2 === 0` → Black ✅
- **move = 3** : Blanc → `3 % 2 === 1` → White ✅

Cela correspond à la logique :
```typescript
const xIsNext = currentMove % 2 === 0;  // Noir joue aux coups pairs
```

---

### 11.9. Résumé des algorithmes et leur interaction

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLUX COMPLET D'UN COUP                           │
└─────────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────────────────────┐
              │ 1. JOUEUR CLIQUE SUR UNE CASE    │
              └─────────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ 2. handleClick(i)               │
              │    ├── Vérifie case vide        │
              │    ├── Détermine currentPlayer  │
              │    ├── isValidMove()            │
              │    │   ├── getFlippedPawns()    │
              │    │   │   └── isOnBoard()       │
              │    │   └── (longueur > 0)       │
              │    ├── Crée nextSquares         │
              │    ├── Placer le pion            │
              │    ├── flipPawn()               │
              │    │   └── getFlippedPawns()    │
              │    └── onPlay(nextSquares)      │
              └─────────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ 3. handlePlay(nextSquares)      │
              │    ├── nextHistory = [...]      │
              │    ├── setHistory()             │
              │    └── setCurrentMove()         │
              └─────────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ 4. RE-RENDER DU COMPOSANT       │
              │    (React met à jour l'UI)      │
              └───────────────────────────────┘
```

---

### 11.10. Complexité et performance

| Fonction | Complexité | Appels typiques | Optimisation possible |
|----------|------------|-----------------|----------------------|
| isOnBoard | O(1) | Très fréquente | Déjà optimale |
| getPawnCount | O(n) | Peu fréquente | Déjà optimale |
| getFlippedPawns | O(n) | Fréquente | ✅ Voir ci-dessous |
| isValidMove | O(n) | Très fréquente | Cache possible |
| hasValidMoves | O(n²) | Moyenne | ✅ Voir ci-dessous |
| flipPawn | O(n) | Peu fréquente | Déjà optimale |
| handleClick | O(n²) | Sur clic | Déjà bonne |

**Où n = 64** (taille du plateau)

---

#### 11.10.1. Optimisation de hasValidMoves

**Version actuelle** : O(n²) car pour chaque case, on appelle `isValidMove` qui appelle `getFlippedPawns` (O(n))

**Version optimisée** : O(n) en vérifiant seulement les cases vides adjacentes à des pions adverses

```typescript
function hasValidMoves(squares: BoardState, currentPlayer: Player): boolean {
    const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';
    
    // Parcourir toutes les cases vides
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
            // Vérifier dans toutes les directions
            const row = Math.floor(i / 8);
            const col = i % 8;
            
            for (const [dr, dc] of directions) {
                let r = row + dr;
                let c = col + dc;
                
                // Si la case adjacente contient un pion adverse
                if (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
                    // Vérifier s'il y a un encerclement dans cette direction
                    while (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
                        r += dr;
                        c += dc;
                    }
                    
                    if (isOnBoard(r, c) && squares[r * 8 + c] === currentPlayer) {
                        return true;  // Coup valide trouvé
                    }
                }
            }
        }
    }
    return false;
}
```

> ⚡ **Avantage** : Évite d'appeler `getFlippedPawns` pour chaque case vide. On ne vérifie que les cases vides **adjacentes à des pions adverses**.

---

### 11.11. Erreurs courantes dans l'implémentation

| Catégorie | Erreur | Conséquence | Solution |
|----------|--------|-------------|----------|
| **Indexation** | Utiliser `squares[i][j]` au lieu de `squares[i*8+j]` | Erreur TypeScript ou runtime | Toujours utiliser l'index linéaire |
| **Immuabilité** | Modifier `squares` directement | L'UI ne se met pas à jour | Toujours utiliser `.slice()` pour copier |
| **Vérification** | Oublier de vérifier `squares[i] !== null` | Jouer sur une case occupée | Toujours vérifier avant de placer |
| **Retournement** | Ne pas vérifier la fin de séquence | Retourner des pions non encerclés | Toujours vérifier `squares[r*8+c] === currentPlayer` |
| **Historique** | Oublier `slice(0, currentMove + 1)` | Garder les anciens futurs | Toujours tronquer l'historique |
| **Joueur actuel** | Confondre `xIsNext` et `currentPlayer` | Mauvaise couleur de pion | `currentPlayer = xIsNext ? 'X' : 'O'` |

---

### 11.12. Conseils pour tester ses algorithmes

1. **Tester chaque fonction individuellement** :
   ```typescript
   // Tester isOnBoard
   console.log(isOnBoard(0, 0)); // true
   console.log(isOnBoard(8, 0)); // false
   
   // Tester getFlippedPawns avec un plateau simple
   const testBoard: BoardState = Array(64).fill(null);
   testBoard[27] = 'X'; testBoard[28] = 'O';
   testBoard[35] = 'O'; testBoard[36] = 'X';
   console.log(getFlippedPawns(testBoard, 19, 'X')); // Doit retourner [] ou [27,28,...]
   ```

2. **Créer des plateaux de test** :
   ```typescript
   // Plateau avec encerclement simple
   const simpleBoard: BoardState = Array(64).fill(null);
   simpleBoard[18] = 'X';  // (2,2)
   simpleBoard[19] = 'O';  // (2,3)
   simpleBoard[20] = 'O';  // (2,4)
   simpleBoard[21] = 'O';  // (2,5)
   simpleBoard[22] = 'X';  // (2,6)
   // X en (2,1) doit retourner (2,2), (2,3), (2,4), (2,5)
   ```

3. **Vérifier visuellement** :
   - Dessiner le plateau sur papier
   - Vérifier manuellement quels pions doivent être retournés
   - Comparer avec le résultat de ta fonction

4. **Utiliser le débogueur** :
   - Dans VS Code : pose des **points d'arrêt** dans tes fonctions
   - Exécute pas à pas pour voir exactement ce qui se passe

---

### 11.13. Diagramme récapitulatif des dépendances

```
                     ┌─────────────────┐
                     │   CONSTANTES    │
                     │   directions    │
                     └────────┬────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────────┐                   ┌───────────────────┐
│  isOnBoard()      │                   │  getPawnCount()    │
└───────────────────┘                   └───────────────────┘
        │
        ▼
┌───────────────────┐
│  getFlippedPawns() │◄────────────────────────────┐
└───────────────────┘             │
        │                             │
        ▼                             ▼
┌───────────────────┐         ┌───────────────────┐
│  isValidMove()    │         │  flipPawn()        │
└───────────────────┘         └───────────────────┘
        │                                     │
        ▼                                     ▼
        └─────────────────┬─────────────────────┘
                          │
                          ▼
                ┌───────────────────┐
                │  handleClick()    │
                └───────────────────┘
                          │
                          ▼
                ┌───────────────────┐
                │  handlePlay()     │◄────────┐
                └───────────────────┘         │
                          │                  │
                          ▼                  ▼
                ┌───────────────────┐   ┌───────────────┐
                │  Board (render)    │   │  Game (state) │
                └───────────────────┘   └───────────────┘
```

**Légende** :
- **Flèches** : Appel de fonction
- **→** : Dépend de
- **┬** : Utilisé par plusieurs fonctions

---

## 12. Bonnes pratiques TypeScript

### 12.1. Typage fort

**Préférer les types spécifiques** :
```typescript
// ❌ Mauvaise
function getValue(index: any): any {
    return board[index];
}

// ✅ Bonne
function getValue(index: number): Pawn {
    return board[index];
}
```

### 12.2. Éviter any

**Utiliser unknown à la place** :
```typescript
// ❌ Mauvaise
let value: any = getExternalValue();

// ✅ Bonne
let value: unknown = getExternalValue();
if (typeof value === 'string') {
    // value est maintenant string
}
```

### 12.3. Type guards

**Vérification de type** :
```typescript
function processValue(value: string | number) {
    if (typeof value === 'string') {
        return value.toUpperCase();
    }
    return value.toFixed(2);
}
```

### 12.4. Interfaces explicites

**Toujours typer les props** :
```typescript
// ❌ Mauvaise
function Square(props) { ... }

// ✅ Bonne
interface SquareProps {
    value: Pawn;
    onSquareClick: () => void;
    isPossibleMove: boolean;
}
function Square({ value, onSquareClick, isPossibleMove }: SquareProps) { ... }
```

### 12.5. Types utilitaires

TypeScript fournit des types utilitaires :

| Type | Description | Exemple |
|------|-------------|---------|
| `Partial<T>` | Rend toutes les propriétés optionnelles | `Partial<SquareProps>` |
| `Required<T>` | Rend toutes les propriétés requises | `Required<Props>` |
| `Readonly<T>` | Rend toutes les propriétés en lecture seule | `Readonly<BoardState>` |
| `Pick<T, K>` | Sélectionne certaines propriétés | `Pick<SquareProps, 'value'>` |
| `Omit<T, K>` | Exclut certaines propriétés | `Omit<SquareProps, 'onSquareClick'>` |
| `Record<K, V>` | Objet avec clés K et valeurs V | `Record<string, number>` |

### 12.6. Génériques

**Syntaxe** :
```typescript
function identity<T>(arg: T): T {
    return arg;
}
```

**Exemple avec React** :
```typescript
function List<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode }) {
    return <div>{items.map(renderItem)}</div>;
}
```

### 12.7. Enums (optionnel)

**Syntaxe** :
```typescript
enum PawnType {
    Black = 'X',
    White = 'O',
    Empty = null
}
```

**Dans le projet, on utilise des union types** :
```typescript
type Pawn = 'X' | 'O' | null;  // Préféré aux enums pour ce cas
```

### 12.8. Const assertions

**Pour des types littéraux précis** :
```typescript
const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, 1], [0, -1],
    [1, -1], [1, 0], [1, 1]
] as const;

// Type : readonly [[-1, -1], [-1, 0], ...]
```

---

## 13. Exemples complets annotés

### 13.1. Types et interfaces
```typescript
// ===== TYPES =====

/** Type pour représenter un pion ou une case vide */
export type Pawn = 'X' | 'O' | null;

/** Type pour représenter un plateau (tableau de 64 cases) */
export type BoardState = Pawn[];

/** Type pour représenter une direction (delta ligne, delta colonne) */
export type Direction = [number, number];

/** Type pour représenter un joueur */
export type Player = 'X' | 'O';

// ===== INTERFACES =====

/** Props pour le composant Square */
interface SquareProps {
    /** Valeur de la case : 'X' (noir), 'O' (blanc) ou null (vide) */
    value: Pawn;
    /** Fonction appelée lors du clic sur la case */
    onSquareClick: () => void;
    /** Indique si un coup est possible à cette position */
    isPossibleMove: boolean;
}

/** Props pour le composant Board */
interface BoardProps {
    /** Indique si c'est au tour des noirs (X) */
    xIsNext: boolean;
    /** État actuel du plateau */
    squares: BoardState;
    /** Fonction appelée après un coup valide */
    onPlay: (squares: BoardState) => void;
}
```

### 13.2. Composant Square
```typescript
/**
 * Composant Square - Une case du plateau
 * 
 * Props:
 * - value: Pawn - 'X' (noir), 'O' (blanc), null (vide)
 * - onSquareClick: fonction appelée au clic
 * - isPossibleMove: booléen pour surbrillance
 */
function Square({ value, onSquareClick, isPossibleMove }: SquareProps): JSX.Element {
    const hasPawn: boolean = value === 'X' || value === 'O';
    const pawnClass: string = value === 'X' ? 'black-pawn' : value === 'O' ? 'white-pawn' : '';

    return (
        <button
            className={`square ${isPossibleMove ? 'possible-move' : ''}`}
            onClick={onSquareClick}
            aria-label={value === 'X' ? 'black pawn' : value === 'O' ? 'white pawn' : isPossibleMove ? 'possible move' : 'empty square'}
        >
            {hasPawn ? (
                <span className={`pawn ${pawnClass}`.trim()} />
            ) : isPossibleMove && (
                <span className="possible-move-indicator" />
            )}
        </button>
    );
}
```

### 13.3. Fonction getFlippedPawns
```typescript
/**
 * Trouve les pions à retourner
 * 
 * @param squares - État actuel du plateau
 * @param i - Index de la case où jouer
 * @param currentPlayer - 'X' ou 'O'
 * @returns Tableau des index des pions à retourner
 */
function getFlippedPawns(squares: BoardState, i: number, currentPlayer: Player): number[] {
    const flipped: number[] = [];
    const row: number = Math.floor(i / 8);
    const col: number = i % 8;
    const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';

    for (const [dr, dc] of directions) {
        let r: number = row + dr;
        let c: number = col + dc;
        let toFlipInDirection: number[] = [];

        // Avance dans la direction tant qu'on trouve des pions adverses
        while (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
            toFlipInDirection.push(r * 8 + c);
            r += dr;
            c += dc;
        }

        // Si on trouve un pion du joueur actuel, les pions intermédiaires sont retournables
        if (isOnBoard(r, c) && squares[r * 8 + c] === currentPlayer) {
            flipped.push(...toFlipInDirection);
        }
    }
    return flipped;
}
```

### 13.4. Composant Board
```typescript
/**
 * Composant Board - Gère le plateau et la logique Othello
 */
function Board({ xIsNext, squares, onPlay }: BoardProps): JSX.Element {
    const directions: Direction[] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, 1],           [0, -1],
        [1, -1],  [1, 0], [1, 1]
    ];

    function getPawnCount(squares: BoardState, pawn: Player): number {
        return squares.filter((s: Pawn) => s === pawn).length;
    }

    function isOnBoard(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    function getFlippedPawns(squares: BoardState, i: number, currentPlayer: Player): number[] {
        // ... (voir exemple précédent)
    }

    function isValidMove(squares: BoardState, i: number, currentPlayer: Player): boolean {
        if (squares[i] !== null) return false;
        return getFlippedPawns(squares, i, currentPlayer).length > 0;
    }

    function hasValidMoves(squares: BoardState, currentPlayer: Player): boolean {
        for (let i = 0; i < squares.length; i++) {
            if (isValidMove(squares, i, currentPlayer)) {
                return true;
            }
        }
        return false;
    }

    function flipPawn(nextSquares: BoardState, i: number, currentPlayer: Player): boolean {
        const flipped = getFlippedPawns(nextSquares, i, currentPlayer);
        for (const index of flipped) {
            nextSquares[index] = currentPlayer;
        }
        return flipped.length > 0;
    }

    function handleClick(i: number): void {
        if (squares[i] !== null) return;
        const currentPlayer: Player = xIsNext ? 'X' : 'O';
        if (!isValidMove(squares, i, currentPlayer)) return;
        const nextSquares: BoardState = squares.slice();
        nextSquares[i] = currentPlayer;
        const flipped = flipPawn(nextSquares, i, currentPlayer);
        if (!flipped) return;
        onPlay(nextSquares);
    }

    const blackCount: number = getPawnCount(squares, 'X');
    const whiteCount: number = getPawnCount(squares, 'O');
    const currentPlayer: Player = xIsNext ? 'X' : 'O';

    const validMoves: number[] = [];
    for (let i = 0; i < squares.length; i++) {
        if (isValidMove(squares, i, currentPlayer)) {
            validMoves.push(i);
        }
    }

    const currentPlayerHasMoves: boolean = validMoves.length > 0;
    const opponent: Player = xIsNext ? 'O' : 'X';
    const opponentHasMoves: boolean = hasValidMoves(squares, opponent);

    let statusText: string = `Black: ${blackCount} | White: ${whiteCount} | Next: ${xIsNext ? 'Black (X)' : 'White (O)'}`;
    if (!currentPlayerHasMoves) {
        if (!opponentHasMoves) {
            statusText = `Game Over! Black: ${blackCount} | White: ${whiteCount} | ${blackCount > whiteCount ? 'Black wins!' : whiteCount > blackCount ? 'White wins!' : 'Draw!'}`;
        } else {
            statusText = `Black: ${blackCount} | White: ${whiteCount} | ${xIsNext ? 'Black' : 'White'} has no valid moves.`;
        }
    }

    const initializeBoard = (): JSX.Element => {
        return (
            Array(8)
            .fill(null)
            .map((_, rowIndex: number) => (
                <div className="board-row" key={rowIndex}>
                    {Array(8)
                    .fill(null)
                    .map((_, colIndex: number) => {
                        const squareIndex = rowIndex * 8 + colIndex;
                        return (
                            <Square
                                key={squareIndex}
                                value={squares[squareIndex]}
                                onSquareClick={() => handleClick(squareIndex)}
                                isPossibleMove={validMoves.includes(squareIndex)}
                            />
                        );
                    })}
                </div>
            ))
        );
    };

    return (
        <div className="board-container">
            <div className="status">{statusText}</div>
            {!currentPlayerHasMoves && opponentHasMoves && (
                <button 
                    className="pass-button" 
                    onClick={() => {
                        const nextSquares: BoardState = squares.slice();
                        onPlay(nextSquares);
                    }}
                >
                    Pass Turn
                </button>
            )}
            <div className="board">
                {initializeBoard()}
            </div>
        </div>
    );
}
```

### 13.5. Composant Game
```typescript
/**
 * Composant Game (principal) - Gère l'état global
 */
export default function Game(): JSX.Element {
    const [ascending, setAscending] = useState<boolean>(false);

    const initialBoard: BoardState = Array(64).fill(null);
    initialBoard[27] = 'X';
    initialBoard[28] = 'O';
    initialBoard[35] = 'O';
    initialBoard[36] = 'X';

    const [history, setHistory] = useState<BoardState[]>([initialBoard]);
    const [currentMove, setCurrentMove] = useState<number>(0);
    const xIsNext: boolean = currentMove % 2 === 0;
    const currentSquares: BoardState = history[currentMove];

    function handlePlay(nextSquares: BoardState): void {
        const nextHistory: BoardState[] = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove: number): void {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares: BoardState, move: number): JSX.Element => {
        let description: string;
        if (move > 0) {
            const prevSquares: BoardState = history[move - 1];
            let squareIndex: number = -1;
            for (let i = 0; i < squares.length; i++) {
                if (squares[i] !== prevSquares[i]) {
                    squareIndex = i;
                    break;
                }
            }
            const rowIndex: number = Math.floor(squareIndex / 8) + 1;
            const colIndex: number = squareIndex % 8 + 1;
            description = `#${move} ${move % 2 === 0 ? "Black" : "White"} played [${rowIndex}, ${colIndex}]`;
        } else {
            description = "Go to game start";
        }
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    });

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
                <span className="move-info">You are at move #{currentMove}</span>
            </div>
            <div className="game-info">
                <button className="toggle-button" onClick={() => setAscending(!ascending)}>
                    Reverse
                </button>
                <ol>{ascending ? moves.reverse() : moves}</ol>
            </div>
        </div>
    );
}
```

---

## 14. Déclarations de Types pour les Fichiers Statiques (CSS, Images, etc.)

### Pourquoi les déclarations de types sont nécessaires

TypeScript ne connaît pas nativement les types des fichiers statiques comme les CSS, images (PNG, JPG, SVG), ou JSON. Quand tu importes ces fichiers dans ton code TypeScript, tu obtiens des erreurs comme :

```
Cannot find module or type declarations for module './styles.css'
```

C'est parce que TypeScript attend que chaque import ait une **déclaration de type** associée.

---

### Rôle des fichiers `.d.ts`

Les fichiers **`.d.ts`** (TypeScript Declaration Files) servent à :
- **Définir des types** pour des modules ou variables qui n'en ont pas naturellement
- **Éviter les erreurs TypeScript** lors de l'import de fichiers non-TypeScript
- **Ajouter des typages globaux** sans modifier le code source des modules

> ⚠️ **Important** : Ces fichiers sont **uniquement pour le typage** et disparaissent à la compilation.

---

### Cas spécifique : Import de fichiers CSS

#### Problème
Quand tu écris dans `index.tsx` :
```tsx
import "./styles.css";
```

TypeScript cherche :
1. Un module TypeScript `styles.css.ts` → ❌ Introuvable
2. Une déclaration de type `styles.css.d.ts` → ❌ Introuvable
3. Une déclaration générique pour `*.css` → ❌ Aucune par défaut

**Résultat** : Erreur TypeScript.

#### Solution : `declare module "*.css"`

Crée un fichier **`src/declarations.d.ts`** avec ce contenu :

```ts
// Déclaration pour les fichiers CSS standards
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Déclaration pour les images
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

// Déclaration pour les SVG (si utilisés comme composants)
declare module "*.svg" {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Déclaration pour les JSON
declare module "*.json" {
  const value: any;
  export default value;
}
```

#### Décortiquons la déclaration CSS

```ts
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
```

| Partie | Signification | Exemple |
|--------|---------------|---------|
| **`declare module "*.css"`** | Déclare un type pour **tous les fichiers `.css`** (glob pattern) | Applique à `styles.css`, `App.module.css`, etc. |
| **`const content`** | TypeScript considère que le module exporte une constante `content` | |
| **`{ [className: string]: string }`** | `content` est un objet où les clés sont des noms de classes et les valeurs sont des strings (pour les classes hashées par CSS Modules) | `{ "board-row": "board-row_abc123", "square": "square_def456" }` |
| **`export default content`** | Le module exporte `content` par défaut | `import styles from "./styles.css"` → `styles` aura le type `{ [key: string]: string }` |

---

### Pourquoi ce type spécifique ?

Il existe deux cas d'utilisation principaux :

#### Cas 1 : CSS "normal" (fichier global)
- Le bundler (CRA, Vite, Webpack) **injecte le CSS dans le DOM**
- **Aucune variable n'est créée** en JavaScript
- La déclaration évite simplement l'erreur TypeScript

#### Cas 2 : CSS Modules
- Le bundler **génère un objet de classes** avec des noms hashés
- Exemple : `{ board: "board_abc123", square: "square_def456" }`
- La déclaration correspond **exactement** à ce comportement réel

> ✅ Dans ton projet (CRA standard), c'est principalement le **Cas 1**, mais la déclaration couvre les deux situations.

---

### Où placer le fichier de déclarations ?

- **Emplacement recommandé** : `src/declarations.d.ts` ou `src/types/global.d.ts`
- **Pourquoi dans `src/` ?**
  - TypeScript **scanne automatiquement** les `.d.ts` dans les dossiers sources
  - Pas besoin de l'importer ailleurs : **les déclarations sont globales**

> ⚠️ **À éviter** : Ne pas placer ces fichiers dans `node_modules/` ou à la racine du projet (sauf configuration spécifique dans `tsconfig.json`).

---

### Comportement du Bundler (CRA/Webpack/Vite)

- **En arrière-plan** : Ton bundler sait déjà gérer les fichiers CSS
- **À l'exécution** :
  - Le CSS est **chargé dans le DOM** (pour les imports normaux)
  - Ou un **objet de classes** est généré (pour CSS Modules)
- **TypeScript** : La déclaration permet simplement au compilateur de comprendre que l'import est valide

---

### Autres déclarations utiles

#### Pour les polices de caractères
```ts
declare module "*.woff" {
  const value: string;
  export default value;
}

declare module "*.woff2" {
  const value: string;
  export default value;
}
```

#### Pour les fichiers de configuration
```ts
declare module "*.env" {
  const value: Record<string, string>;
  export default value;
}
```

#### Pour les assets audio
```ts
declare module "*.mp3" {
  const value: string;
  export default value;
}
```

---

### Vérification que ça fonctionne

1. **Crée le fichier** `src/declarations.d.ts` avec les déclarations
2. **Redémarre ton serveur** (`npm start` ou `yarn start`)
3. **L'erreur TypeScript doit disparaître** dans tous tes fichiers

> 💡 **Astuce** : Si l'erreur persiste, vérifie que :
> - Le fichier est bien nommé `.d.ts` (et pas `.ts`)
> - Il est dans le bon dossier (`src/`)
> - Ton `tsconfig.json` inclut bien `src/` dans `include` (normalement le cas avec Create React App)

---

### Bonnes pratiques supplémentaires

1. **Sépare les déclarations** par type de fichier pour plus de clarté
2. **Documente tes déclarations** avec des commentaires
3. **Utilise des types plus précis** quand possible (ex: pour les SVG, utilise `React.FC<React.SVGProps<SVGSVGElement>>`)
4. **Évite `any`** même dans les déclarations
5. **Mets à jour tes déclarations** si tu changes de bundler ou de configuration

---

### Exemple complet avec CSS Modules

Si tu utilises CSS Modules dans ton projet :

```tsx
// Dans ton composant
import styles from './App.module.css';

function MyComponent() {
  return <div className={styles.container}>...</div>;
}
```

Avec la déclaration dans `declarations.d.ts`, TypeScript saura que :
- `styles` est de type `{ [key: string]: string }`
- Tu as **l'autocomplétion** pour les noms de classes
- Tu évites les erreurs de typage

---

### Résumé

| Problème | Solution | Bénéfice |
|----------|----------|----------|
| Erreur TypeScript sur import CSS | `declare module "*.css"` | ✅ Plus d'erreurs de compilation |
| Manque d'autocomplétion | Déclarations de types | ✅ Meilleure expérience développeur |
| Types incorrects pour les assets | Déclarations spécifiques | ✅ Code plus sûr et maintenable |
| Fichiers non reconnus | Fichier `.d.ts` global | ✅ Solution centralisée et réutilisable |
## Conclusion

Ce guide couvre tout ce dont vous avez besoin pour comprendre et recréer **App.tsx** avec TypeScript :

- **Pourquoi TypeScript** avec React et ses avantages
- **Configuration** du projet TypeScript
- **Types TypeScript** (union, tuple, littéraux, etc.)
- **Interfaces** pour les props des composants
- **Tous les keywords JavaScript/TypeScript** utilisés
- **Tous les keywords React** avec types
- **La logique complète** du jeu Othello
- **Les algorithmes** expliqués avec types
- **Les bonnes pratiques TypeScript**
- **Des exemples complets** annotés

### Ressources :
- **React Docs** : [https://react.dev/](https://react.dev/)
- **TypeScript Docs** : [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- **TypeScript + React** : [https://www.typescriptlang.org/docs/handbook/react.html](https://www.typescriptlang.org/docs/handbook/react.html)
- **MDN JavaScript** : [https://developer.mozilla.org/fr/docs/Web/JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript)
- **React Tutorial** : [https://react.dev/learn](https://react.dev/learn)

### Points clés à retenir :
1. **TypeScript ajoute la sécurité des types** à React
2. **Les interfaces** définissent la structure des props
3. **Les types personnalisés** (type aliases) améliorent la lisibilité
4. **useState<Type>** pour typer l'état
5. **Les fonctions typées** améliorent la maintenabilité
6. **Éviter any** pour garder la sécurité des types
7. **Utiliser les type guards** pour des vérifications de type sûres

Le projet utilise maintenant : **TypeScript**, **useState typé**, **composants fonctionnels typés**, **JSX**, **tableaux typés**, **algorithmes typés**, et **bonnes pratiques TypeScript** pour créer un jeu Othello robuste et maintenable.

---

