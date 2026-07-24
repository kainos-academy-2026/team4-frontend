@register @mock @security @ux @cross-page
Feature: Register user page
  As an applicant
  I want safe and clear registration interactions
  So that I avoid accidental duplicate requests and can navigate predictably

  Scenario: Email error clears after correcting input and resubmitting
    Given I am on the register page
    And the register API responds with success
    When I submit registration with email "invalid-email" and password "StrongPass1!"
    Then I should see email error "Please enter a valid email address."
    When I submit registration with email "valid.user@example.com" and password "StrongPass1!"
    Then I should see email error hidden
    And the register API should be called 1 time
