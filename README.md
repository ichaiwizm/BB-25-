# Simulateur de Machines de Turing Busy Beaver

Un simulateur interactif de machines de Turing avec un focus sur le problème du Busy Beaver, construit avec React et TypeScript.

## Fonctionnalités

- **Simulation interactive** : Exécutez pas à pas ou en mode continu
- **Machines prédéfinies** : Σ(2), Σ(3), Σ(4), Σ(5) et candidat Σ(6)
- **Éditeur de machines personnalisées** : Créez vos propres machines
- **Générateur intelligent** : Génération aléatoire avec stratégies Busy Beaver
- **Sauvegarde locale** : Stockage de vos machines dans localStorage
- **Visualisation en temps réel** : Graphiques de progression et statistiques
- **Interface moderne** : Design professionnel avec contrôles intuitifs

## Technologies

- **React 19** avec hooks et TypeScript
- **Vite** pour le build et développement
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Déploiement

Ce projet est configuré pour Vercel avec la configuration `vercel.json` incluse.

## Architecture

- **Context Pattern** : Gestion d'état global avec `MachineContext`
- **Pure Reducer** : Logique de machine dans `machineReducer`
- **Stockage sparse** : Gestion efficace de la bande infinie
- **Composants modulaires** : Architecture découplée et réutilisable

## Fonctionnalités avancées

- **Détection de performance** : Adaptation automatique selon la vitesse
- **Prévention des boucles** : Limite de sécurité à 1M d'étapes
- **Génération intelligente** : Évitement des machines triviales
- **Import/Export** : Partage de machines personnalisées

## Raccourcis clavier

- **Espace** : Play/Pause
- **Flèche droite** : Étape suivante
- **Ctrl+R** : Reset
- **H** : Aide
- **1-4** : Contrôle de vitesse