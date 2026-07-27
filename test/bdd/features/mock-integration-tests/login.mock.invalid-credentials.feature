@login @mock @invalid-credentials
Feature: Login page
  As an applicant
  I want clear authentication failures
  So that I know when credentials are incorrect

  Scenario: Invalid credentials are shown as a user-facing login error
    Given I am on the login page
    And the login endpoint responds with invalid credentials message "Invalid email or password."
    When I submit login with email "existing.user@example.com" and password "WrongPass1!"
    Then I should stay on the login page
    And I should see login error "Invalid email or password."
    And the login POST should be called 1 time
