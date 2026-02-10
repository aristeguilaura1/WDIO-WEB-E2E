import { $ } from '@wdio/globals';

/**
 * Empty fields validation interface
 */
interface EmptyFieldsValidation {
    name: boolean;
    address: boolean;
    city: boolean;
    state: boolean;
    zipCode: boolean;
    cardNumber: boolean;
}

/**
 * Card type interface
 */
interface CardType {
    value: string;
    text: string;
}

/**
 * Purchase Page - Handle passenger and payment information form
 */
class PurchasePage {
    /**
     * Passenger Information Selectors
     */
    public get nameInput() { 
        return $('#inputName'); 
    }

    public get addressInput() { 
        return $('#address'); 
    }

    public get cityInput() { 
        return $('#city'); 
    }

    public get stateInput() { 
        return $('#state'); 
    }

    public get zipCodeInput() { 
        return $('#zipCode'); 
    }
    
    /**
     * Payment Information Selectors
     */
    public get cardTypeSelect() { 
        return $('#cardType'); 
    }

    public get creditCardNumberInput() { 
        return $('#creditCardNumber'); 
    }

    public get creditCardMonthInput() { 
        return $('#creditCardMonth'); 
    }

    public get creditCardYearInput() { 
        return $('#creditCardYear'); 
    }

    public get nameOnCardInput() { 
        return $('#nameOnCard'); 
    }
    
    /**
     * Form Controls
     */
    public get rememberMeCheckbox() { 
        return $('#rememberMe'); 
    }

    public get purchaseFlightButton() { 
        return $('input[value="Purchase Flight"]'); 
    }
    
    /**
     * Page Elements
     */
    public get pageTitle() { 
        return $('h2'); 
    }

    public get flightSummary() { 
        return $('.table'); 
    }

    /**
     * Wait for purchase page to load
     */
    public async waitForPurchasePage(): Promise<void> {
        await this.nameInput.waitForDisplayed({ timeout: 10000 });
        await this.purchaseFlightButton.waitForDisplayed({ timeout: 10000 });
        console.log('✓ Purchase page loaded successfully');
    }

    /**
     * Fill passenger information
     * @param name - Passenger name
     * @param address - Passenger address
     * @param city - Passenger city
     * @param state - Passenger state
     * @param zipCode - Passenger zip code
     */
    public async fillPassengerInformation(name: string, address: string, city: string, state: string, zipCode: string): Promise<void> {
        console.log('\n===== FILLING PASSENGER INFORMATION =====');
        
        await this.nameInput.waitForDisplayed();
        await this.nameInput.setValue(name);
        console.log(`✓ Name: ${name}`);
        
        await this.addressInput.setValue(address);
        console.log(`✓ Address: ${address}`);
        
        await this.cityInput.setValue(city);
        console.log(`✓ City: ${city}`);
        
        await this.stateInput.setValue(state);
        console.log(`✓ State: ${state}`);
        
        await this.zipCodeInput.setValue(zipCode);
        console.log(`✓ Zip Code: ${zipCode}`);
    }

    /**
     * Fill payment information
     * @param cardType - Card type (visa, mastercard, amex)
     * @param creditCardNumber - Credit card number
     * @param creditCardMonth - Credit card expiration month
     * @param creditCardYear - Credit card expiration year
     * @param nameOnCard - Name on credit card
     */
    public async fillPaymentInformation(cardType: string, creditCardNumber: string, creditCardMonth: string, creditCardYear: string, nameOnCard: string): Promise<void> {
        console.log('\n===== FILLING PAYMENT INFORMATION =====');
        
        await this.cardTypeSelect.waitForDisplayed();
        await this.cardTypeSelect.selectByAttribute('value', cardType);
        console.log(`✓ Card Type: ${cardType}`);
        
        await this.creditCardNumberInput.setValue(creditCardNumber);
        console.log(`✓ Credit Card Number: ${'*'.repeat(creditCardNumber.length - 4)}${creditCardNumber.slice(-4)}`);
        
        await this.creditCardMonthInput.setValue(creditCardMonth);
        console.log(`✓ Expiration Month: ${creditCardMonth}`);
        
        await this.creditCardYearInput.setValue(creditCardYear);
        console.log(`✓ Expiration Year: ${creditCardYear}`);
        
        await this.nameOnCardInput.setValue(nameOnCard);
        console.log(`✓ Name on Card: ${nameOnCard}`);
    }

    /**
     * Check remember me checkbox
     */
    public async checkRememberMe(): Promise<void> {
        await this.rememberMeCheckbox.waitForDisplayed();
        if (!(await this.rememberMeCheckbox.isSelected())) {
            await this.rememberMeCheckbox.click();
            console.log('✓ Remember Me checkbox checked');
        }
    }

    /**
     * Submit the purchase form
     */
    public async submitPurchase(): Promise<void> {
        console.log('\n===== SUBMITTING PURCHASE =====');
        
        // Check remember me before submitting
        await this.checkRememberMe();
        
        // Take screenshot before submission
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await browser.saveScreenshot(`./reports/screenshots/before_purchase_${timestamp}.png`);
        
        await this.purchaseFlightButton.waitForClickable();
        await this.purchaseFlightButton.click();
        
        console.log('✓ Purchase form submitted');
        
        // Wait for navigation to confirmation page
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('confirmation') || 
                      (await browser.getTitle()).includes('BlazeDemo Confirmation'),
            { 
                timeout: 15000, 
                timeoutMsg: 'Confirmation page did not load after purchase submission' 
            }
        );
    }

    /**
     * Get flight summary information from purchase page
     */
    public async getFlightSummary(): Promise<string> {
        await this.flightSummary.waitForDisplayed();
        const summaryText = await this.flightSummary.getText();
        console.log('Flight Summary:', summaryText);
        return summaryText;
    }

    /**
     * Validate purchase form fields are empty (for negative testing)
     */
    public async validateEmptyFields(): Promise<EmptyFieldsValidation> {
        const nameValue = await this.nameInput.getValue();
        const addressValue = await this.addressInput.getValue();
        const cityValue = await this.cityInput.getValue();
        const stateValue = await this.stateInput.getValue();
        const zipCodeValue = await this.zipCodeInput.getValue();
        const cardNumberValue = await this.creditCardNumberInput.getValue();
        
        return {
            name: nameValue === '',
            address: addressValue === '',
            city: cityValue === '',
            state: stateValue === '',
            zipCode: zipCodeValue === '',
            cardNumber: cardNumberValue === ''
        };
    }

    /**
     * Get available card types
     */
    public async getAvailableCardTypes(): Promise<CardType[]> {
        await this.cardTypeSelect.waitForDisplayed();
        const options = await this.cardTypeSelect.$$('option');
        const cardTypes: CardType[] = [];
        
        for (let option of options) {
            const value = await option.getAttribute('value');
            const text = await option.getText();
            if (value && value !== '') {
                cardTypes.push({ value, text });
            }
        }
        return cardTypes;
    }

    /**
     * Clear all form fields
     */
    public async clearAllFields(): Promise<void> {
        await this.nameInput.clearValue();
        await this.addressInput.clearValue();
        await this.cityInput.clearValue();
        await this.stateInput.clearValue();
        await this.zipCodeInput.clearValue();
        await this.creditCardNumberInput.clearValue();
        await this.creditCardMonthInput.clearValue();
        await this.creditCardYearInput.clearValue();
        await this.nameOnCardInput.clearValue();
        console.log('✓ All form fields cleared');
    }
}

export default new PurchasePage();