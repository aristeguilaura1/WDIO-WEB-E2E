import { $ } from '@wdio/globals';
import Page from './page.js';

/**
 * BlazeDemo Main Page - Home page and flight search functionality
 */
class BlazeDemoPage extends Page {
    /**
     * Define selectors using getter methods
     */
    public get originDropdown() { 
        return $('select[name="fromPort"]'); 
    }

    public get destinationDropdown() { 
        return $('select[name="toPort"]'); 
    }

    public get findFlightsButton() { 
        return $('input[type="submit"]'); 
    }

    public get pageTitle() { 
        return $('h1'); 
    }

    /**
     * Navigate to BlazeDemo application
     */
    public async open(): Promise<void> {
        await browser.url('https://blazedemo.com');
        await browser.maximizeWindow();
        await this.waitForPageLoad();
    }

    /**
     * Wait for page elements to load
     */
    public async waitForPageLoad(): Promise<void> {
        await this.originDropdown.waitForDisplayed({ timeout: 10000 });
        await this.destinationDropdown.waitForDisplayed({ timeout: 10000 });
    }

    /**
     * Search for flights from origin to destination
     * @param origin - Origin city
     * @param destination - Destination city
     */
    public async searchFlights(origin: string, destination: string): Promise<void> {
        console.log(`\n===== SEARCHING FLIGHTS FROM ${origin} TO ${destination} =====`);
        
        await this.originDropdown.waitForDisplayed();
        await this.originDropdown.selectByAttribute('value', origin);
        
        await this.destinationDropdown.waitForDisplayed();
        await this.destinationDropdown.selectByAttribute('value', destination);
        
        await this.findFlightsButton.click();
        
        // Wait for navigation to flight selection page
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('reserve'),
            { timeout: 10000, timeoutMsg: 'Flight search results page did not load' }
        );
    }

    /**
     * Get available origin cities
     */
    public async getOriginOptions(): Promise<Array<{value: string, text: string}>> {
        await this.originDropdown.waitForDisplayed();
        const options = await this.originDropdown.$$('option');
        const cities: Array<{value: string, text: string}> = [];
        
        for (let option of options) {
            const value = await option.getAttribute('value');
            const text = await option.getText();
            if (value && value !== '') {
                cities.push({ value, text });
            }
        }
        return cities;
    }

    /**
     * Get available destination cities  
     */
    public async getDestinationOptions(): Promise<Array<{value: string, text: string}>> {
        await this.destinationDropdown.waitForDisplayed();
        const options = await this.destinationDropdown.$$('option');
        const cities: Array<{value: string, text: string}> = [];
        
        for (let option of options) {
            const value = await option.getAttribute('value');
            const text = await option.getText();
            if (value && value !== '') {
                cities.push({ value, text });
            }
        }
        return cities;
    }

    /**
     * Validate page title
     */
    public async validatePageTitle(expectedTitle: string): Promise<void> {
        const actualTitle = await browser.getTitle();
        expect(actualTitle).toBe(expectedTitle);
    }
}

export default new BlazeDemoPage();