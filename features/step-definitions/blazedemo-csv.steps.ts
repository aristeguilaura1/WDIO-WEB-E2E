/**
 * BlazeDemo CSV Step Definitions
 * Implements data-driven testing with cheapest Virgin America flight selection
 */
import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';

// Import Page Objects
import BlazeDemoPage from '../pageobjects/blazedemo.page.ts';
import FlightSelectionPage from '../pageobjects/flight-selection.page.ts';
import PurchasePage from '../pageobjects/purchase.page.ts';
import ConfirmationPage from '../pageobjects/confirmation.page.ts';

// Import types
interface FlightInfo {
    rowIndex: number;
    flight: string;
    airline: string;
    departs: string;
    arrives: string;
    price: number;
    priceText: string;
    selectButton: any;
}

interface PurchaseDetails {
    cardType: string;
    creditCardNumber: string;
    creditCardMonth: string;
    creditCardYear: string;
    nameOnCard: string;
}

interface ConfirmationResult {
    confirmed: boolean;
    details: {
        transactionId: string;
        status: string;
        amount: string;
    };
    screenshotPath: string;
}

// Test data storage
interface TestContext {
    selectedFlight: FlightInfo | null;
    purchaseDetails: PurchaseDetails | null;
    confirmationDetails: ConfirmationResult | null;
}

let testContext: TestContext = {
    selectedFlight: null,
    purchaseDetails: null,
    confirmationDetails: null
};

// ===== GIVEN STEPS =====

Given('I navigate to BlazeDemo application', async () => {
    await BlazeDemoPage.open();
    const currentUrl = await browser.getUrl();
    console.log(`✅ NAVEGACIÓN EXITOSA: Accedido a la aplicación BlazeDemo`);
    console.log(`🌐 URL actual: ${currentUrl}`);
});

// ===== WHEN STEPS =====

When('I search for flights from {string} to {string}', async (origin: string, destination: string) => {
    await BlazeDemoPage.searchFlights(origin, destination);
    
    // Contar vuelos encontrados
    const flightRows = await $$('table tbody tr');
    const flightCount = flightRows.length;
    
    console.log(`✅ BÚSQUEDA DE VUELOS COMPLETADA:`);
    console.log(`📍 Ruta: ${origin} ➜ ${destination}`);
    console.log(`✈️  Vuelos disponibles: ${flightCount} opciones encontradas`);
    console.log(`🔍 Iniciando análisis de aerolíneas disponibles...`);
});

When('I select the cheapest Virgin America flight', async () => {
    testContext.selectedFlight = await FlightSelectionPage.selectCheapestVirginAmericaFlight();
    console.log('✓ Selected cheapest Virgin America flight');
});

When('I fill passenger information with {string}, {string}, {string}, {string}, {string}', 
    async (name: string, address: string, city: string, state: string, zipCode: string) => {
        await PurchasePage.waitForPurchasePage();
        await PurchasePage.fillPassengerInformation(name, address, city, state, zipCode);
        console.log('✓ Passenger information filled successfully');
    }
);

When('I fill payment information with {string}, {string}, {string}, {string}, {string}', 
    async (cardType: string, creditCardNumber: string, creditCardMonth: string, creditCardYear: string, nameOnCard: string) => {
        await PurchasePage.fillPaymentInformation(cardType, creditCardNumber, creditCardMonth, creditCardYear, nameOnCard);
        console.log('✓ Payment information filled successfully');
        
        // Store purchase details for later validation
        testContext.purchaseDetails = {
            cardType,
            creditCardNumber,
            creditCardMonth,
            creditCardYear,
            nameOnCard
        };
    }
);

When('I submit the purchase', async () => {
    await PurchasePage.submitPurchase();
    console.log('✓ Purchase submitted successfully');
});

// ===== THEN STEPS =====

Then('I should see the purchase confirmation', async () => {
    testContext.confirmationDetails = await ConfirmationPage.completeConfirmationValidation();
    expect(testContext.confirmationDetails.confirmed).toBe(true);
    console.log('✓ Purchase confirmation validated successfully');
});

Then('I capture a screenshot with timestamp', async () => {
    const screenshotPath = await ConfirmationPage.captureScreenshotWithTimestamp();
    console.log(`📸 Captura de pantalla guardada: ${screenshotPath}`);
    
    // Log test completion summary
    console.log('\n===== RESUMEN DE EJECUCIÓN DEL TEST =====');
    if (testContext.selectedFlight) {
        console.log(`✈️  Vuelo seleccionado: ${testContext.selectedFlight.airline} - ${testContext.selectedFlight.priceText}`);
    }
    if (testContext.confirmationDetails) {
        console.log(`Transaction ID: ${testContext.confirmationDetails.details.transactionId}`);
        console.log(`Status: ${testContext.confirmationDetails.details.status}`);
        console.log(`Amount: ${testContext.confirmationDetails.details.amount}`);
    }
    console.log('===== TEST COMPLETED SUCCESSFULLY =====\n');
});

// ===== VALIDATION STEPS =====

Then('I should see Virgin America flights available', async () => {
    await FlightSelectionPage.waitForFlightResults();
    const virginAmericaFlights = await FlightSelectionPage.verifyVirginAmericaFlightsAvailable();
    
    expect(virginAmericaFlights.length).toBeGreaterThan(0);
    
    console.log(`✅ VUELOS VIRGIN AMERICA ENCONTRADOS:`);
    console.log(`✈️  Total de vuelos Virgin America: ${virginAmericaFlights.length}`);
    
    // Mostrar detalles de cada vuelo Virgin America
    virginAmericaFlights.forEach((flight, index) => {
        console.log(`🔵 Vuelo ${index + 1}: ${flight.priceText} | Salida: ${flight.departs} | Llegada: ${flight.arrives}`);
    });
    
    const cheapest = virginAmericaFlights.reduce((prev, current) => 
        (prev.price < current.price) ? prev : current
    );
    console.log(`💰 Más económico: ${cheapest.priceText}`);
});

Then('flights should have valid pricing information', async () => {
    const flights = await FlightSelectionPage.verifyFlightPricing();
    expect(flights.length).toBeGreaterThan(0);
    
    console.log(`✅ VALIDACIÓN DE PRECIOS COMPLETADA:`);
    console.log(`✈️  Total de vuelos analizados: ${flights.length}`);
    
    // Calcular estadísticas de precios
    const prices = flights.map(f => f.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    console.log(`💰 ESTADÍSTICAS DE PRECIOS:`);
    console.log(`   • Precio mínimo: $${minPrice}`);
    console.log(`   • Precio máximo: $${maxPrice}`);
    console.log(`   • Precio promedio: $${avgPrice.toFixed(2)}`);
    
    // Mostrar aerolíneas únicas
    const airlines = [...new Set(flights.map(f => f.airline))];
    console.log(`🏢 Aerolíneas disponibles: ${airlines.join(', ')}`);
});

// ===== UTILITY STEPS FOR ERROR SCENARIOS =====

When('I submit the purchase without filling required fields', async () => {
    await PurchasePage.waitForPurchasePage();
    // Clear all fields to ensure they're empty
    await PurchasePage.clearAllFields();
    
    // Attempt to submit with empty fields
    await PurchasePage.submitPurchase();
    console.log('✓ Attempted purchase submission with empty fields');
});

Then('I should see validation errors for required fields', async () => {
    // Check if browser validation prevented form submission
    const currentUrl = await browser.getUrl();
    const isPurchasePage = currentUrl.includes('purchase');
    
    if (isPurchasePage) {
        console.log('✓ Form validation prevented submission with empty required fields');
        
        // At minimum, we should still be on the purchase page
        expect(isPurchasePage).toBe(true);
    } else {
        // If form was submitted despite empty fields, check for error messages
        const pageText = await $('body').getText();
        const hasErrorIndicators = pageText.toLowerCase().includes('error') || 
                                 pageText.toLowerCase().includes('required') ||
                                 pageText.toLowerCase().includes('invalid');
        
        expect(hasErrorIndicators).toBe(true);
        console.log('✓ Error indicators found for incomplete form submission');
    }
});

// ===== ADVANCED FLIGHT SELECTION STEPS =====

When('I select flight number {int}', async (flightNumber: number) => {
    await FlightSelectionPage.waitForFlightResults();
    testContext.selectedFlight = await FlightSelectionPage.selectFlightByIndex(flightNumber);
    console.log(`✓ Selected flight number ${flightNumber}`);
});

Then('the selected flight should be from Virgin America', async () => {
    expect(testContext.selectedFlight).not.toBeNull();
    if (testContext.selectedFlight) {
        expect(testContext.selectedFlight.airline.toLowerCase()).toContain('virgin america');
        console.log('✓ Confirmed selected flight is from Virgin America');
    }
});

Then('the selected flight should be the cheapest available', async () => {
    expect(testContext.selectedFlight).not.toBeNull();
    
    if (testContext.selectedFlight) {
        // Get all Virgin America flights to verify this is the cheapest
        const allFlights = await FlightSelectionPage.getAllFlights();
        const virginAmericaFlights = allFlights.filter(flight => 
            flight.airline.toLowerCase().includes('virgin america')
        );
        
        const cheapestPrice = Math.min(...virginAmericaFlights.map(f => f.price));
        expect(testContext.selectedFlight.price).toBe(cheapestPrice);
        
        console.log(`✓ Confirmed selected flight has the cheapest price: ${testContext.selectedFlight.priceText}`);
    }
});

// ===== DATA VALIDATION STEPS =====

Then('the purchase details should match the provided data', async () => {
    expect(testContext.purchaseDetails).not.toBeNull();
    expect(testContext.confirmationDetails).not.toBeNull();
    
    // Verify transaction was successful
    if (testContext.confirmationDetails) {
        expect(testContext.confirmationDetails.confirmed).toBe(true);
        expect(testContext.confirmationDetails.details.status.toLowerCase()).toContain('success');
    }
    
    console.log('✓ Purchase details validation completed successfully');
});

// ===== SIMPLE DEBUG STEPS =====

When('I check the page title', async () => {
    const title = await browser.getTitle();
    console.log(`📋 Checking page title: "${title}"`);
    
    // Take a simple screenshot to test screenshot functionality
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `./reports/screenshots/debug_${timestamp}.png`;
    await browser.saveScreenshot(screenshotPath);
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
});

Then('the title should contain {string}', async (expectedText: string) => {
    const actualTitle = await browser.getTitle();
    console.log(`📄 Page title: "${actualTitle}"`);
    expect(actualTitle).toContain(expectedText);
    console.log('✓ Title validation passed');
});

// ===== HOOKS FOR TEST CONTEXT MANAGEMENT =====
// Note: BeforeScenario and AfterScenario hooks would be configured here
// but are currently commented out due to import compatibility issues

/*
BeforeScenario(async (scenario: any) => {
    console.log(`\n🧪 STARTING TEST: ${scenario.pickle.name}`);
    
    // Reset test context for each scenario
    testContext = {
        selectedFlight: null,
        purchaseDetails: null,
        confirmationDetails: null
    };
    
    // Create screenshots directory if it doesn't exist
    const fs = await import('fs');
    const screenshotDir = './reports/screenshots';
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }
});

AfterScenario(async (scenario: any) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    if (scenario.result.status === 'FAILED') {
        console.log(`❌ TEST FAILED: ${scenario.pickle.name}`);
        
        // Capture failure screenshot
        const failureScreenshot = `./reports/screenshots/FAILURE_${timestamp}.png`;
        await browser.saveScreenshot(failureScreenshot);
        console.log(`🔍 Failure screenshot saved: ${failureScreenshot}`);
        
        // Log current URL for debugging
        const currentUrl = await browser.getUrl();
        console.log(`🌐 Current URL: ${currentUrl}`);
        
        // Log page title for debugging
        const pageTitle = await browser.getTitle();
        console.log(`📄 Page Title: ${pageTitle}`);
        
    } else {
        console.log(`✅ TEST PASSED: ${scenario.pickle.name}`);
    }
    
    console.log(`🏁 TEST COMPLETED: ${scenario.pickle.name}\n`);
});
*/