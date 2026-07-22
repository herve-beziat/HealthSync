# 🩺 HealthSync: Plateforme de Prise de Rendez-vous Médicaux

Ce projet est une API de gestion de rendez-vous médicaux conçue pour la performance et la scalabilité, utilisant une architecture micro-services hybride (REST/gRPC).

## Structure du projet

```
HealthSync/
├── api/                    # Service REST principal
│   ├── src/
│   └── tests/
├── grpc-service/           # Service gRPC
│   ├── proto/
│   └── src/
├── docs/
│   ├── rapport-owasp.pdf   # Rapport sécurité OWASP
│   ├── architecture.png    # Schéma de composants
│   ├── adr.md               # Architecture Decision Record
│   └── presentation.pdf    # Support de soutenance
├── CONTRIBUTING.md         # Definition of Done + Git workflow
└── README.md
```

## Installation

Le projet utilise un **Makefile** pour simplifier la gestion des conteneurs Docker.

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Make](https://www.gnu.org/software/make/)

### Étapes d'installation

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/votre-repo/HealthSync.git
   cd HealthSync
   ```

2. **Initialiser l'environnement** (création du `.env` et configuration des permissions) :

   ```bash
   make init
   ```

3. **Lancer les services** :
   ```bash
   make launch
   ```

### Commandes utiles

| Commande                   | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| `make launch`              | Construit et lance tous les services en arrière-plan.         |
| `make stop`                | Arrête les services.                                          |
| `make start`               | Démarre les services précédemment arrêtés.                    |
| `make logs`                | Affiche les logs des conteneurs en temps réel.                |
| `make ps`                  | Affiche l'état des conteneurs.                                |
| `make remove`              | Arrête et supprime les conteneurs, réseaux et volumes.        |
| `make rebuild s=<service>` | Reconstruit un service spécifique (ex: `make rebuild s=api`). |
| `make test-all`            | Exécute tous les tests.                                       |

## Architecture

Le système est divisé en deux composants principaux pour séparer les responsabilités :

1. API Gateway / Core (Hono.js) : Gère l'authentification, les utilisateurs, et l'orchestration des rendez-vous.
2. Slot Service (gRPC) : Service haute-performance dédié au calcul de la disponibilité des médecins.

```Mermaid
graph TD
    Client[Client Web/Mobile] -- REST/JSON --> Gateway[API Core - Hono.js]
    Gateway -- Protobuf/HTTP2 --> SlotService[Slot Service - gRPC]
    Gateway -- SQL --> DB[(PostgreSQL)]
    SlotService -- SQL --> DB
    Gateway -- Auth --> JWT[JWT / Argon2]
```
