@register @mock @validation @email
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  @email
  Scenario Outline: Invalid email is blocked by client-side validation
    Given I am on the register page
    And the register API responds with success
    When I submit registration with email "<email>" and password "StrongPass1!"
    Then I should see email error "Please enter a valid email address."
    And the register API should be called 0 times

    Examples:
      | email                    |
      | not-an-email             |
      | missing-at-example.com   |
      | missing-domain@          |
      | user@.com                |
      | user@example             |
      | user example@example.com |
      |                          |
      |  @example.com            |