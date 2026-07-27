@login @mock @error @resilience
Feature: Login page
  As an applicant
  I want resilient login error handling
  So that temporary backend failures are surfaced clearly

  Scenario: Service unavailable returns fallback error message on login page
    Given I am on the login page
    And the login endpoint responds with service unavailable message "Login service unavailable. Please try again later."
    When I submit login with email "existing.user@example.com" and password "StrongPass1!"
    Then I should stay on the login page
    And I should see login error "Login service unavailable. Please try again later."
    And the login POST should be called 1 time
