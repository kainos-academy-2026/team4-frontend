@register @mock @error @success @fallback
Feature: Register user page
  As an applicant
  I want registration outcomes to show resilient status messaging
  So that missing backend message fields do not break the user flow

  Scenario: Success without response message still uses default success copy
    Given I am on the register page
    And the register API responds with success and no message
    When I submit registration with email "fallback.success@example.com" and password "StrongPass1!"
    Then I should see register status "Registration Successful, redirecting you to the login page"
    And I should be redirected to the login page
    And the register API should be called 1 time
