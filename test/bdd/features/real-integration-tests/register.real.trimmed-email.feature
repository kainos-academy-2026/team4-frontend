@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario: Register request sends a trimmed email payload
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with the generated email surrounded by spaces and password "StrongPass1!"
    Then the register API should be called 1 time
    And the register request email should match the generated email
