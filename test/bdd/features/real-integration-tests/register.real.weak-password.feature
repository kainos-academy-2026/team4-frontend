@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario Outline: Weak password is blocked by client-side validation
    Given I am on the register page
    And I observe register API requests
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
