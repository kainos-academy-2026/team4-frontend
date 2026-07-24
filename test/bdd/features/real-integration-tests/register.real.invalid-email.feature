@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario Outline: Invalid email is blocked by client-side validation
    Given I am on the register page
    And I observe register API requests
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
