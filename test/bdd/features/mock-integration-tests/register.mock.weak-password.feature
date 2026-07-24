@register @mock @validation @password
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario Outline: Weak password is blocked by client-side validation
    Given I am on the register page
    And the register API responds with success
    When I submit registration with email "valid.user@example.com" and password "<password>"
    Then I should see register status hidden
    And the register API should be called 0 times

    Examples:
      | password     |
      |              |
      | weak         |
      | PASSWORD123  |
      | password123  |
      | Password123  |
      | Pass1!       |
