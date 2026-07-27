@login @real-backend @integration @recovery
Feature: Login page with real backend integration
  As an applicant
  I want to retry login after a failed attempt
  So that I can recover by entering valid credentials

  Scenario: Retry succeeds after initial invalid credentials
    Given I am on the login page
    And I observe login POST requests
    And I have a real registered login user with password "StrongPass1!"
    When I submit login with the generated email and password "WrongPass1!"
    Then I should stay on the login page
    And I should see login error "Invalid email or password."
    And the login POST should be called 1 time
    When I submit login with the generated email and password "StrongPass1!"
    Then I should be redirected to the home page
    And I should see authenticated header actions
    And the login POST should be called 2 times
