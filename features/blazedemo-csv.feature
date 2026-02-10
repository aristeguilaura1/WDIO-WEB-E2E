Feature: BlazeDemo CSV Data-Driven Testing
  As a user of the BlazeDemo flight booking system
  I want to search for flights and complete reservations using CSV data
  To verify that the system works correctly with different airlines and passenger data

  Scenario: Verify Virgin America flight availability
    Given I navigate to BlazeDemo application
    When I search for flights from "Boston" to "London"
    Then I should see Virgin America flights available
    And flights should have valid pricing information

  Scenario Outline: Complete flight booking with CSV data
    Given I navigate to BlazeDemo application
    When I search for flights from "<origin>" to "<destination>"
    And I select the cheapest Virgin America flight
    And I fill passenger information with "<name>", "<address>", "<city>", "<state>", "<zipCode>"
    And I fill payment information with "<cardType>", "<creditCardNumber>", "<creditCardMonth>", "<creditCardYear>", "<nameOnCard>"
    And I submit the purchase
    Then I should see the purchase confirmation
    And I capture a screenshot with timestamp

    Examples:
      | testName           | origen    | destino | name       | address         | city       | state      | zipCode | cardType   | creditCardNumber | creditCardMonth | creditCardYear | nameOnCard |
      | Reservation Test 1 | San Diego | London  | Laura      | Calle Falsa 123 | Rosario    | Santa Fe   | 121212  | visa       | 4111111111111113 | 05              | 2026           | Laura Cler |
      | Reservation Test 2 | Boston    | New York| John Doe   | 456 Main St     | Springfield| Illinois   | 62701   | mastercard | 5555555555554444 | 12              | 2027           | John Doe   |
      | Reservation Test 3 | Portland  | Berlin  | Jane Smith | 789 Oak Ave     | Portland   | Oregon     | 97201   | amex       | 378282246310005  | 03              | 2028           | Jane Smith |

  Scenario: Verificación de disponibilidad de vuelos Virgin America
    Given I navigate to BlazeDemo application
    When I search for flights from "Boston" to "London"
    Then I should see Virgin America flights available
    And flights should have valid pricing information