@login @real-backend @integration @validation
Feature: Login page with real backend integration
  As an applicant
  I want server-side validation handling to be consistent
  So that missing or invalid input receives clear feedback

  Scenario: Missing email and password returns validation message
    Given I am on the login page
    And I observe login POST requests
    And the login form bypasses native validation
    When I submit login with email "" and password ""
    Then I should stay on the login page
    And I should see login error "Please enter both your email and password."
    And the login POST should be called 1 time
