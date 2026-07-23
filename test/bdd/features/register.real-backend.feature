@register @real-backend @integration
Feature: Register user page with real backend integration
  As an applicant
  I want to register against live backend infrastructure
  So that frontend behavior is validated against real API and data state

  Scenario: Successful registration with unique email persists in backend
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with the generated email and password "StrongPass1!"
    Then I should see register status "Registration Successful, redirecting you to the login page"
    And I should be redirected to the login page
    And the register API should be called 1 time

  Scenario: Registering the same email twice shows duplicate account message
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with the generated email and password "StrongPass1!"
    Then I should see register status "Registration Successful, redirecting you to the login page"
    And I should be redirected to the login page
    Given I am on the register page
    And I observe register API requests
    When I submit registration with the generated email and password "StrongPass1!"
    Then I should see register status "That email is already registered. Try logging in or use a different email."
    And I should stay on the register page
    And the register API should be called 1 time

  Scenario Outline: Invalid email is blocked by client-side validation
    Given I am on the register page
    And I observe register API requests
    When I submit registration with email "<email>" and password "StrongPass1!"
    Then I should see email error "Please enter a valid email address."
    And the register API should be called 0 times

    Examples:
      | email                    |
      | not-an-email             |
      | missing-at-example.com   |
      | missing-domain@          |
      | user@.com                |
      | user@example             |
      | user example@example.com |
      |                          |
      |  @example.com            |

  Scenario Outline: Weak password is blocked by client-side validation
    Given I am on the register page
    And I observe register API requests
    When I submit registration with email "valid.user@example.com" and password "<password>"
    Then I should see register status hidden
    And the register API should be called 0 times

    Examples:
      | password     |
      |              |
      | weak         |
      | PASSWORD123  |
      | password123  |
      | Password123  |
      | Pass1!       |

  Scenario: Register request sends a trimmed email payload
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with the generated email surrounded by spaces and password "StrongPass1!"
    Then the register API should be called 1 time
    And the register request email should match the generated email

  Scenario: Header login link takes user to the login page
    Given I am on the register page
    And I observe register API requests
    When I click the register page Log in link
    Then I should be redirected to the login page
    And the register API should be called 0 times

  Scenario: Email error clears after correcting input and resubmitting
    Given I am on the register page
    And I observe register API requests
    And I have a unique registration email
    When I submit registration with email "invalid-email" and password "StrongPass1!"
    Then I should see email error "Please enter a valid email address."
    When I submit registration with the generated email and password "StrongPass1!"
    Then I should see email error hidden
    And the register API should be called 1 time

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
