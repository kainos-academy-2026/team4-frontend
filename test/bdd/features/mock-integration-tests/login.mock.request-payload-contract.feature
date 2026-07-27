@login @mock @contract @navigation
Feature: Login page
  As an applicant
  I want login requests and navigation actions to behave predictably
  So that authentication and cross-page movement are reliable

  Scenario: Login submission posts expected form payload contract
    Given I am on the login page
    And the login endpoint responds with success redirect
    When I submit login with email "contract.user@example.com" and password "StrongPass1!"
    Then the login request email should be "contract.user@example.com"
    And the login request password should be "StrongPass1!"
    And the login POST should be called 1 time
