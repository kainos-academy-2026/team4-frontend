@register @mock @security @ux @cross-page
Feature: Register user page
  As an applicant
  I want safe and clear registration interactions
  So that I avoid accidental duplicate requests and can navigate predictably

  Scenario: Header login link takes user to the login page
    Given I am on the register page
    When I click the register page Log in link
    Then I should be redirected to the login page
    And the register API should be called 0 times
