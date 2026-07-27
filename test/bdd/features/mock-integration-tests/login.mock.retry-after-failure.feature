@login @mock @recovery
Feature: Login page
  As an applicant
  I want to recover after a failed login attempt
  So that I can retry with correct credentials

  Scenario: Failed login can be retried and then succeed
    Given I am on the login page
    And the login endpoint first fails with invalid credentials then succeeds
    When I submit login with email "existing.user@example.com" and password "WrongPass1!"
    Then I should stay on the login page
    And I should see login error "Invalid email or password."
    And the login POST should be called 1 time
    When I retry login with email "existing.user@example.com" and password "StrongPass1!"
    Then I should be redirected to the home page
    And I should see authenticated header actions
    And the login POST should be called 2 times
