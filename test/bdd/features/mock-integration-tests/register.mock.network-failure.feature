@register @mock @network @error
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: Network failure shows fallback error message
    Given I am on the register page
    And the register API fails with a network error
    When I submit registration with email "network.user@example.com" and password "StrongPass1!"
    Then I should see register status "Something went wrong. Please try again."
    And I should stay on the register page
    And the register API should be called 1 time