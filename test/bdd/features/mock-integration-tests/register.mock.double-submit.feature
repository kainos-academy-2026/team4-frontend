@register @mock @security @ux @cross-page
Feature: Register user page
  As an applicant
  I want safe and clear registration interactions
  So that I avoid accidental duplicate requests and can navigate predictably

  Scenario: Rapid double submit only triggers one registration request
    Given I am on the register page
    And the register API responds with success after 300 milliseconds
    When I submit registration twice quickly with email "double.submit@example.com" and password "StrongPass1!"
    Then the register API should be called 1 time
    And I should see register status "Registration Successful, redirecting you to the login page"
