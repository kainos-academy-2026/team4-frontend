@register @mock @error @success @fallback
Feature: Register user page
  As an applicant
  I want registration outcomes to show resilient status messaging
  So that missing backend message fields do not break the user flow

  Scenario: Internal error without response message uses generic fallback message
    Given I am on the register page
    And the register API responds with an internal error and no message
    When I submit registration with email "fallback.error@example.com" and password "StrongPass1!"
    Then I should see register status "Something went wrong. Please try again."
    And I should stay on the register page
    And the register API should be called 1 time
