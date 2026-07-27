@login @real-backend @integration @success
Feature: Login page with real backend integration
  As an applicant
  I want to log in against the live backend
  So that frontend login behavior is verified end-to-end

  Scenario: Successfully log in with a newly registered account
    Given I am on the login page
    And I observe login POST requests
    And I have a real registered login user with password "StrongPass1!"
    When I submit login with the generated email and password "StrongPass1!"
    Then I should be redirected to the home page
    And I should see authenticated header actions
    And the login POST should be called 1 time
    And the login request email should match the generated email
