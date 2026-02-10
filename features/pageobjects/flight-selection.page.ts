import { $ } from '@wdio/globals';

/**
 * Flight information interface
 */
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

/**
 * Flight Selection Page - Handle flight selection with cheapest Virgin America logic
 */
class FlightSelectionPage {
    /**
     * Define selectors using getter methods
     */
    public get flightTable() { 
        return $('table'); 
    }

    public get flightRows() { 
        return $$('table tbody tr'); 
    }

    public get pageTitle() { 
        return $('h3'); 
    }

    /**
     * Wait for flight results page to load
     */
    public async waitForFlightResults(): Promise<void> {
        await this.flightTable.waitForDisplayed({ timeout: 15000 });
        await browser.pause(2000); // Allow all flights to load
    }

    /**
     * Get flight information from a specific row
     * @param rowIndex - Row index (1-based)
     */
    public async getFlightInfo(rowIndex: number): Promise<FlightInfo> {
        const row = await $(`table tbody tr:nth-child(${rowIndex})`);
        
        const flight = await row.$('td:nth-child(2)').getText();
        const airline = await row.$('td:nth-child(4)').getText(); // Aerolínea en columna 4
        const departs = await row.$('td:nth-child(5)').getText();
        const arrives = await row.$('td:nth-child(6)').getText();
        const priceText = await row.$('td:nth-child(3)').getText(); // Precio en columna 3
        const price = parseFloat(priceText.replace('$', ''));
        const formattedPriceText = priceText.startsWith('$') ? priceText : `$${priceText}`;

        console.log(`Flight ${rowIndex}: ${flight} | ${formattedPriceText} | ${airline} | ${departs} | ${arrives}`);
        console.log(`Flight ${rowIndex}: ${airline.trim()} - ${formattedPriceText}`);

        return {
            rowIndex,
            flight: flight.trim(),
            airline: airline.trim(),
            departs: departs.trim(),
            arrives: arrives.trim(),
            price,
            priceText: formattedPriceText,
            selectButton: row.$('td:nth-child(1) input')
        };
    }

    /**
     * Get all available flights with their information
     */
    public async getAllFlights(): Promise<FlightInfo[]> {
        await this.waitForFlightResults();
        const rows = await this.flightRows;
        const flights: FlightInfo[] = [];

        console.log('\n===== ANALYZING AVAILABLE FLIGHTS =====');
        
        for (let i = 0; i < await rows.length; i++) {
            const flightInfo = await this.getFlightInfo(i + 1);
            flights.push(flightInfo);
            console.log(`Flight ${i + 1}: ${flightInfo.airline} - ${flightInfo.priceText}`);
        }
        
        return flights;
    }

    /**
     * Select the cheapest Virgin America flight (based on Robot Framework logic)
     */
    public async selectCheapestVirginAmericaFlight(): Promise<FlightInfo> {
        const flights = await this.getAllFlights();
        
        console.log('\n===== SEARCHING FOR CHEAPEST VIRGIN AMERICA FLIGHT =====');
        
        // Filter Virgin America flights
        console.log('\n===== FILTERING FOR VIRGIN AMERICA FLIGHTS =====');
        flights.forEach((flight, index) => {
            console.log(`Flight ${index + 1}: "${flight.airline}" | Price: ${flight.priceText}`);
            const isVirginAmerica = flight.airline.toLowerCase().includes('virgin america');
            console.log(`  → Virgin America match: ${isVirginAmerica}`);
        });
        
        const virginAmericaFlights = flights.filter(flight => 
            flight.airline.toLowerCase().includes('virgin america')
        );
        
        console.log(`Found ${virginAmericaFlights.length} Virgin America flights`);
        
        if (virginAmericaFlights.length === 0) {
            console.log('ERROR: No Virgin America flights found');
            throw new Error('No Virgin America flights found in the results');
        }
        
        // Find cheapest Virgin America flight
        const cheapestFlight = virginAmericaFlights.reduce((min, flight) => 
            flight.price < min.price ? flight : min
        );
        
        console.log(`\n===== SELECTING CHEAPEST VIRGIN AMERICA FLIGHT =====`);
        console.log(`Selected: Row ${cheapestFlight.rowIndex} - ${cheapestFlight.airline} - ${cheapestFlight.priceText}`);
        console.log(`Flight: ${cheapestFlight.flight} | Departs: ${cheapestFlight.departs} | Arrives: ${cheapestFlight.arrives}`);
        
        // Take screenshot of selected flight row
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rowElement = await $(`table tbody tr:nth-child(${cheapestFlight.rowIndex})`);
        await rowElement.saveScreenshot(`./reports/screenshots/selected_flight_${timestamp}.png`);
        
        // Click select button
        console.log(`🎯 Selecting cheapest Virgin America flight (Row ${cheapestFlight.rowIndex})`);
        
        // Try different selectors for the button
        const row = this.flightTable.$(`tbody tr:nth-child(${cheapestFlight.rowIndex})`);
        let buttonFound = false;
        
        // Try multiple button selectors
        const selectors = [
            'td:nth-child(1) input[type="submit"]',
            'td:nth-child(1) input',
            'td input[type="submit"]',
            'input[type="submit"]',
            'td:nth-child(1) button',
            'button'
        ];
        
        for (const selector of selectors) {
            try {
                const button = row.$(selector);
                if (await button.isExisting()) {
                    console.log(`✅ Found button with selector: ${selector}`);
                    await button.click();
                    buttonFound = true;
                    break;
                }
            } catch (e) {
                console.log(`❌ Selector ${selector} failed: ${(e as Error).message}`);
                continue;
            }
        }
        
        if (!buttonFound) {
            console.log('⚠️ Could not find button, trying original selector...');
            try {
                await cheapestFlight.selectButton.click();
            } catch (originalError) {
                console.log(`❌ Original selector also failed: ${(originalError as Error).message}`);
                throw new Error(`Could not click flight selection button for row ${cheapestFlight.rowIndex}. All selectors failed.`);
            }
        }
        
        // Wait for navigation to purchase page
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('purchase'),
            { timeout: 10000, timeoutMsg: 'Purchase page did not load after flight selection' }
        );
        
        return cheapestFlight;
    }

    /**
     * Verify Virgin America flights are available
     */
    public async verifyVirginAmericaFlightsAvailable(): Promise<FlightInfo[]> {
        const flights = await this.getAllFlights();
        
        console.log('\n🔍 DEBUG - All flights for Virgin America filtering:');
        flights.forEach((flight, index) => {
            console.log(`Flight ${index + 1}: "${flight.airline}" (lowercase: "${flight.airline.toLowerCase()}")`);
            console.log(`  - Contains "virgin america"?: ${flight.airline.toLowerCase().includes('virgin america')}`);
        });
        
        const virginAmericaFlights = flights.filter(flight => 
            flight.airline.toLowerCase().includes('virgin america')
        );
        
        console.log(`\n🎯 Virgin America flights found: ${virginAmericaFlights.length}`);
        virginAmericaFlights.forEach((flight, index) => {
            console.log(`  ${index + 1}. ${flight.airline} - Price: ${flight.price}`);
        });
        
        expect(virginAmericaFlights.length).toBeGreaterThan(0);
        console.log(`✓ Found ${virginAmericaFlights.length} Virgin America flights`);
        
        return virginAmericaFlights;
    }

    /**
     * Verify all flights have valid pricing information
     */
    public async verifyFlightPricing(): Promise<FlightInfo[]> {
        const flights = await this.getAllFlights();
        
        flights.forEach((flight, index) => {
            expect(flight.price).toBeGreaterThan(0);
            expect(flight.priceText).toMatch(/^\$\d+(\.\d{2})?$/);
            console.log(`✓ Flight ${index + 1} has valid pricing: ${flight.priceText}`);
        });
        
        return flights;
    }

    /**
     * Select a specific flight by row index
     * @param rowIndex - Row index (1-based)
     */
    public async selectFlightByIndex(rowIndex: number): Promise<FlightInfo> {
        const flightInfo = await this.getFlightInfo(rowIndex);
        console.log(`Selecting flight ${rowIndex}: ${flightInfo.airline} - ${flightInfo.priceText}`);
        
        await flightInfo.selectButton.click();
        
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('purchase'),
            { timeout: 10000, timeoutMsg: 'Purchase page did not load after flight selection' }
        );
        
        return flightInfo;
    }
}

export default new FlightSelectionPage();