@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario: Password checklist updates as the user types
    Given I am on the register page
    And I observe register API requests
    When I type password "weak"
    Then password requirement "length" should be unmet
    And password requirement "uppercase" should be unmet
    And password requirement "lowercase" should be met
    And password requirement "special" should be unmet
    When I type password "StrongPass1!"
    Then password requirement "length" should be met
    And password requirement "uppercase" should be met
    And password requirement "lowercase" should be met
    And password requirement "special" should be met
    And the register API should be called 0 times
