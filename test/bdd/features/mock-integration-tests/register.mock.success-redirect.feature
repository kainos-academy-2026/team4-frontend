@register @mock @success @redirect
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: Successful registration shows success and redirects to login
    Given I am on the register page
    And the register API responds with success
    When I submit registration with email "new.user@example.com" and password "StrongPass1!"
    Then I should see register status "Registration Successful, redirecting you to the login page"
    And I should be redirected to the login page
    And the register API should be called 1 time