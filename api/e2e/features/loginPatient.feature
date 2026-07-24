Feature: Connexion d'un patient

  Scenario: Connexion réussie après inscription
    Given j'ai les informations d'un nouveau patient
    When j'envoie une requête POST vers "/auth/register" avec ces informations
    And j'envoie une requête POST vers "/auth/login" avec les mêmes informations
    Then la réponse doit retourner un code de statut 200 OK
    And le corps de la réponse doit contenir un jeton JWT valide