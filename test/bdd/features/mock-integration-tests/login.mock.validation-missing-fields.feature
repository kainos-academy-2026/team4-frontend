@login @mock @validation
Feature: Login page
  As an applicant
  I want clear validation feedback for invalid login submissions
  So that I can correct input issues before retrying

  Scenario: Missing email and password shows validation error
    Given I am on the login page
    And I observe login POST requests
    And the login form bypasses native validation
    When I submit login with email "" and password ""
    Then I should stay on the login page
    And I should see login error "Please enter both your email and password."
    And the login POST should be called 1 time
