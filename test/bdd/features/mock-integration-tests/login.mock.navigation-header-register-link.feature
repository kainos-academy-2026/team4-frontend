@login @mock @contract @navigation
Feature: Login page
  As an applicant
  I want login requests and navigation actions to behave predictably
  So that authentication and cross-page movement are reliable

  Scenario: Header Register link navigates to register page
    Given I am on the login page
    When I click the login page header Register link
    Then I should be redirected to the register page
