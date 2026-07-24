@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario: Header login link takes user to the login page
    Given I am on the register page
    And I observe register API requests
    When I click the register page Log in link
    Then I should be redirected to the login page
    And the register API should be called 0 times
