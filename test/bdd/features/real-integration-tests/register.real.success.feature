@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario: Successful registration with unique email persists in backend
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with the generated email and password "StrongPass1!"
    Then I should see register status "Registration Successful, redirecting you to the login page"
    And I should be redirected to the login page
    And the register API should be called 1 time
