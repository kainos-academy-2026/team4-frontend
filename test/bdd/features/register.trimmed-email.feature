@register @payload @trim
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: Register request sends a trimmed email payload
    Given I am on the register page
    And the register API responds with success
    When I submit registration with email "  spaced.user@example.com  " and password "StrongPass1!"
    Then the register API should be called 1 time
    And the register request email should be "spaced.user@example.com"