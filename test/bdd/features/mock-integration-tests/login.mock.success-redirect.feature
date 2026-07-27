@login @mock @success @redirect
Feature: Login page
  As an applicant
  I want to log in from the frontend page
  So that I can access authenticated pages

  Scenario: Successful login redirects to home with authenticated header actions
    Given I am on the login page
    And the login endpoint responds with success redirect
    When I submit login with email "existing.user@example.com" and password "StrongPass1!"
    Then I should be redirected to the home page
    And I should see authenticated header actions
    And the login POST should be called 1 time
