Feature: Cycle de vie complet d'un rendez-vous
  En tant qu'utilisateur, je veux pouvoir créer un compte, 
  réserver un créneau, gérer les conflits et annuler.

  Scenario: Parcours complet de réservation et conflit
    Given un nouveau patient "Alice" avec l'email "alice.e2e@example.com"
    And un nouveau médecin "Dr. Smith" avec l'email "smith.e2e@example.com"
    And le médecin a un planning le lundi de "09:00" à "17:00"
    
    When le patient "Alice" se connecte
    And le patient réserve un rendez-vous le "2025-10-27T10:00:00Z" pour 30 minutes avec "Dr. Smith"
    Then le rendez-vous est confirmé

    When le patient tente de réserver le même créneau avec "Dr. Smith"
    Then le système retourne une erreur de conflit

    When le patient annule son rendez-vous
    Then le rendez-vous est marqué comme supprimé ou annulé
