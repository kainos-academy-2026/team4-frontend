@register @loading @ui-state
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: Submit is disabled while registration request is in flight
    Given I am on the register page
    And the register API responds with success after 300 milliseconds
    When I submit registration with email "loading.user@example.com" and password "StrongPass1!"
    Then the register submit button should be disabled
    And I should see register status "Registration Successful, redirecting you to the login page"
    And the register submit button should be enabled
    And the register API should be called 1 time