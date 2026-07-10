# Contribuer à HealthSync

Ce document décrit le workflow Git et la Definition of Done à respecter pour toute contribution au projet.

## Workflow Git

### Branches

| Branche | Rôle | Protection |
|---|---|---|
| `main` | Simule la production | Protégée, mise à jour uniquement via une release depuis `develop` |
| `develop` | Branche d'intégration | Protégée, PR obligatoire + 1 revue avant merge |
| `feature/...`, `fix/...`, `chore/...` | Travail courant | Créées à partir de `develop` |

### Convention de nommage des branches

- `feature/US-XX-description-courte` — nouvelle fonctionnalité
- `fix/US-XX-description-courte` — correction de bug
- `chore/description-courte` — tâche technique (setup, config, CI...)

### Convention de commits

Les commits suivent le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
feat: ajoute la prise de rendez-vous avec vérification des conflits
fix: corrige la double réservation sur créneaux simultanés
test: ajoute les tests unitaires du service de créneaux
docs: met à jour le README avec la procédure d'installation
chore: configure le pipeline de couverture de tests
```

### Règles de contribution

1. Toute modification passe par une branche dédiée créée à partir de `develop`. Aucun push direct sur `main` ou `develop`.
2. Minimum 5 commits par branche de travail, sauf modification mineure (ex. typo dans un doc) où 1 commit suffit.
3. Une fois le travail terminé : push de la branche, ouverture d'une Pull Request vers `develop` (le template de PR s'affiche automatiquement).
4. Merge des PR vers `develop` : **Merge commit** (l'historique des commits est conservé, pas de squash).
5. Après merge : `git checkout develop && git pull`, puis suppression de la branche locale (`git branch -d <branche>`) — la branche remote est supprimée automatiquement.
6. Mise à jour de `main` : PR `develop` → `main` à chaque release, taguée (ex. `v0.1.0`).

## Definition of Done

Une tâche n'est considérée comme terminée que si tous les critères suivants sont remplis :

| Critère | Description |
|---|---|
| Tests écrits et passants | Les tests unitaires et/ou d'intégration liés à la story sont écrits et verts, en local et en CI. |
| Couverture non régressée | La couverture sur la logique métier reste au-dessus de 60%, ou ne baisse pas par rapport à l'état avant la PR. |
| Revue de code obligatoire | La PR est relue et approuvée par l'autre membre du binôme avant merge ; pas d'auto-merge. |
| Lint et build propres | Le linter et le build passent sans erreur ni warning bloquant. |
| Commits conventionnels | Les messages de commit suivent le format conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`...). |
| Documentation à jour | Un changement d'endpoint REST met à jour le Swagger/OpenAPI ; un changement d'architecture met à jour le README ou l'ADR. |
| Pas de régression de sécurité | Aucune vulnérabilité connue du OWASP Top 10 introduite (entrées validées, pas de secret en dur, etc.). |
| Gestion d'erreurs cohérente | Codes HTTP appropriés côté REST, codes de statut gRPC appropriés côté gRPC, messages explicites. |
| Critères d'acceptation de l'issue remplis | Chaque critère listé dans l'issue GitHub est vérifié avant de la fermer. |
| PR liée à une issue | Chaque PR référence l'issue qu'elle résout (ex. `Closes #12`) pour déclencher la fermeture automatique du board. |

## Pull Requests

Chaque Pull Request doit :

- Cibler `develop` (jamais `main` directement)
- Référencer l'issue qu'elle résout (`Closes #XX`)
- Remplir la checklist du template de PR (`.github/pull_request_template.md`)
- Être relue et approuvée par l'autre membre du binôme avant merge
