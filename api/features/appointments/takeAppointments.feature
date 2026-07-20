Feature: Make an appointments as a patient
    
    Scenario: Successfully making an appointment
    Given Je suis un patient authentifié et que le médecin est disponible à la date et l'heure souhaitées.
    When J'envoie une requête de reservation au service REST.
    Then Le système doit appeler le service patient via gRPC pour valider mon existence.
    And Un nouveau rendez-vous doit être créé en base de données avec le statut 'scheduled'.
    And Je reçois une Réponse HTTP 201 Created avec les détails du rendez-vous créé.
