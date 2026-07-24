@register @mock @network @retry
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: User can retry after a network failure and then succeed
    Given I am on the register page
    And the register API fails with a network error
    When I submit registration with email "retry.user@example.com" and password "StrongPass1!"
    Then I should see register status "Something went wrong. Please try again."
    And the register API should be called 1 time
    And the register API responds with success for subsequent requests
    When I submit registration with email "retry.user@example.com" and password "StrongPass1!"
    Then I should see register status "Registration Successful, redirecting you to the login page"
    And the register API should be called 2 times
    And I should be redirected to the login page