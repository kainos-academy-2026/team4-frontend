@register @mock @error @duplicate
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: Duplicate email response is surfaced to the user
    Given I am on the register page
    And the register API responds with conflict message "That email is already registered. Please use a different one."
    When I submit registration with email "existing.user@example.com" and password "StrongPass1!"
    Then I should see register status "That email is already registered. Please use a different one."
    And I should stay on the register page
    And the register API should be called 1 time