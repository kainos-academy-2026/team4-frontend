@login @real-backend @integration @navigation
Feature: Login page with real backend integration
  As an applicant
  I want reliable navigation from login to register
  So that I can create an account when needed

  Scenario: Footer Register link takes user to register page
    Given I am on the login page
    When I click the login page footer Register link
    Then I should be redirected to the register page
