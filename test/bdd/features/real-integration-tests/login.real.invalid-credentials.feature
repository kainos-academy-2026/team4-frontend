@login @real-backend @integration @invalid-credentials
Feature: Login page with real backend integration
  As an applicant
  I want invalid credentials to be rejected by the backend
  So that authentication failures are shown clearly to users

  Scenario: Invalid credentials show login error
    Given I am on the login page
    And I observe login POST requests
    When I submit login with email "nonexistent.user@example.com" and password "WrongPass1!"
    Then I should stay on the login page
    And I should see login error "Invalid email or password."
    And the login POST should be called 1 time
