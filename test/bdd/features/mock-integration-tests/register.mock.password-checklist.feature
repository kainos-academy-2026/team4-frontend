@register @mock @validation @checklist
Feature: Register user page
  As an applicant
  I want to register from the frontend page
  So that I can create an account without relying on a real backend during test runs

  Scenario: Password checklist updates as the user types
    Given I am on the register page
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