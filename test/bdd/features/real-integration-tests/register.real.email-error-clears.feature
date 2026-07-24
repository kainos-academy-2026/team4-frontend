@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario: Email error clears after correcting input and resubmitting
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with email "invalid-email" and password "StrongPass1!"
    Then I should see email error "Please enter a valid email address."
    When I submit registration with the generated email and password "StrongPass1!"
    Then I should see email error hidden
    And the register API should be called 1 time
