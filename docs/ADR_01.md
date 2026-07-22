# ADR 01 : Choix de Hono.js, PostgreSQL, gRPC, Argon2/JWT et Docker pour la plateforme de prise de rendez-vous

## Statut
Accepté

## Contexte et problème
Nous devons concevoir une plateforme de prise de rendez-vous capable de supporter un volume important de requêtes tout en garantissant l’intégrité des données, notamment l’absence de double réservation. Le système doit également offrir une faible latence pour la consultation des disponibilités, rester maintenable dans le temps et permettre une évolution progressive des fonctionnalités.

## Facteurs de décision
- Garantir l’intégrité transactionnelle des réservations.
- Réduire la latence des requêtes fréquentes.
- Maintenir une architecture simple à faire évoluer.
- Sécuriser l’authentification et le stockage des mots de passe.
- Faciliter le déploiement, les tests et les migrations.
- Préparer l’ajout de fonctionnalités futures comme la géolocalisation.

## Options envisagées

### 1. Framework backend
- Express.js
- Hono.js
- Fastify

### 2. Base de données
- MySQL
- PostgreSQL
- MongoDB

### 3. Communication inter-services
- REST/JSON
- gRPC
- Message broker uniquement

### 4. Authentification et hachage des mots de passe
- BCrypt + sessions serveur
- Argon2 + JWT
- Scrypt + JWT

### 5. Infrastructure
- Déploiement manuel
- Docker uniquement
- Docker + CI/CD

## Décision
Nous retenons Hono.js, PostgreSQL, gRPC, Argon2/JWT et Docker + CI/CD, car cette combinaison offre le meilleur équilibre entre performance, robustesse, maintenabilité et automatisation pour les besoins actuels de la plateforme.

### Framework : Hono.js
Hono.js a été retenu pour sa légèreté, sa compatibilité native avec TypeScript et son positionnement orienté performance. La documentation officielle présente Hono comme un framework web construit sur les standards web et met en avant des résultats de benchmarks. [https://hono.dev/docs/concepts/benchmarks](https://hono.dev/docs/concepts/benchmarks) [web:40]

### Base de données : PostgreSQL
PostgreSQL a été choisi pour ses garanties transactionnelles et son adéquation avec des applications qui nécessitent de fortes propriétés ACID. La documentation PostgreSQL met en avant son support des transactions et de l’isolation transactionnelle. [https://www.postgresql.org/files/developer/transactions.pdf](https://www.postgresql.org/files/developer/transactions.pdf) [web:43]

### Communication inter-services : gRPC
gRPC a été retenu pour les échanges internes entre services, car il fournit un contrat strict via des fichiers `.proto` et une communication efficace adaptée aux appels fréquents entre services. La documentation officielle gRPC présente ces concepts et son support multi-plateforme. [https://grpc.io/docs/](https://grpc.io/docs/) [web:38]

### Sécurité : Argon2 et JWT
Argon2 a été retenu pour le hachage des mots de passe car il est issu de la Password Hashing Competition et conçu pour améliorer la résistance face aux attaques par force brute, notamment avec des ressources matérielles spécialisées. Les recherches de référence sur Argon2 décrivent précisément son origine et ses propriétés de sécurité. [https://www.arxiv.org/abs/1602.03097](https://www.arxiv.org/abs/1602.03097) [web:31]

### Infrastructure : Docker et CI/CD
Docker a été choisi pour garantir la reproductibilité des environnements de développement, de test et de production. La documentation Docker présente les conteneurs comme un moyen de standardiser l’exécution des applications et de faciliter le déploiement. [https://docs.docker.com/get-started/docker-overview/](https://docs.docker.com/get-started/docker-overview/) [web:46]

## Conséquences

### Positives
- Les opérations de réservation bénéficient de garanties transactionnelles fortes. [web:43]
- Les communications internes gagnent en clarté et en efficacité grâce à un contrat explicite. [web:38]
- Le stockage des mots de passe est renforcé par un algorithme moderne et conçu pour résister aux attaques par GPU. [web:31]
- Les environnements sont plus homogènes grâce à Docker. [web:46]

### Négatives
- gRPC ajoute de la complexité d’intégration et de supervision. [web:38]
- PostgreSQL impose une discipline plus forte sur les migrations et la gestion transactionnelle. [web:43]
- Docker et CI/CD demandent une mise en place initiale plus structurée. [web:46]

## Alternatives rejetées

### Express.js
Express.js a été écarté au profit de Hono.js afin de privilégier un cadre plus léger et plus orienté performance. [web:40]

### REST/JSON pour l’inter-service
REST a été considéré, mais gRPC a été privilégié pour les échanges internes fréquents, notamment pour son contrat strict et sa sérialisation plus efficace. [web:38]

### BCrypt
BCrypt a été considéré, mais Argon2 a été retenu car il provient de la Password Hashing Competition et offre un meilleur cadre moderne pour le hachage des mots de passe. [web:31]

## Notes d’implémentation
- Les migrations de schéma devront rester compatibles autant que possible avec les anciennes versions de l’application.
- Les changements cassants devront être découpés en plusieurs étapes.
- Les déploiements devront être automatisés via CI/CD.
- Les décisions d’architecture devront être mises à jour si les contraintes évoluent.