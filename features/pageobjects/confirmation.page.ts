import { $ } from '@wdio/globals';

/**
 * Purchase details interface
 */
interface PurchaseDetails {
    transactionId: string;
    status: string;
    amount: string;
}

/**
 * Confirmation validation result interface
 */
interface ConfirmationResult {
    confirmed: boolean;
    details: PurchaseDetails;
    screenshotPath: string;
}

/**
 * Confirmation Page - Handle purchase confirmation and validation
 */
class ConfirmationPage {
    /**
     * Define selectors using getter methods
     */
    public get confirmationTitle() { 
        return $('h1'); 
    }

    public get confirmationMessage() { 
        return $('.hero-unit h1'); 
    }

    public get purchaseDetails() { 
        return $('.table'); 
    }

    public get transactionId() { 
        return $('tr:nth-child(1) td:nth-child(2)'); 
    }

    public get status() { 
        return $('tr:nth-child(2) td:nth-child(2)'); 
    }

    public get amount() { 
        return $('tr:nth-child(3) td:nth-child(2)'); 
    }
    
    /**
     * Expected confirmation message from Robot Framework
     */
    private static readonly CONFIRMATION_MESSAGE = 'Thank you for your purchase today!';

    /**
     * Wait for confirmation page to load
     */
    public async waitForConfirmationPage(): Promise<void> {
        await this.confirmationTitle.waitForDisplayed({ timeout: 15000 });
        console.log('✓ Confirmation page loaded successfully');
    }

    /**
     * Verify purchase confirmation (main validation from Robot Framework)
     */
    public async verifyPurchaseConfirmation(): Promise<boolean> {
        await this.waitForConfirmationPage();
        
        console.log('\n===== VERIFYING PURCHASE CONFIRMATION =====');
        
        // Get confirmation message
        const confirmationText = await this.confirmationTitle.getText();
        console.log(`Confirmation message: "${confirmationText}"`);
        
        // Verify confirmation message matches expected
        if (confirmationText === ConfirmationPage.CONFIRMATION_MESSAGE) {
            console.log('✓ Purchase completed successfully');
            return true;
        } else {
            console.log(`✗ ERROR: Expected "${ConfirmationPage.CONFIRMATION_MESSAGE}", but got "${confirmationText}"`);
            throw new Error(`Purchase confirmation failed. Expected: "${ConfirmationPage.CONFIRMATION_MESSAGE}", Actual: "${confirmationText}"`);
        }
    }

    /**
     * Get purchase confirmation details
     */
    public async getPurchaseDetails(): Promise<PurchaseDetails> {
        await this.purchaseDetails.waitForDisplayed();
        
        const transactionId = await this.transactionId.getText();
        const status = await this.status.getText();
        const amount = await this.amount.getText();
        
        const details: PurchaseDetails = {
            transactionId: transactionId.trim(),
            status: status.trim(),
            amount: amount.trim()
        };
        
        console.log('\n===== PURCHASE DETAILS =====');
        console.log(`Transaction ID: ${details.transactionId}`);
        console.log(`Status: ${details.status}`);
        console.log(`Amount: ${details.amount}`);
        
        return details;
    }

    /**
     * Capture screenshot with timestamp (equivalent to Robot Framework function)
     */
    public async captureScreenshotWithTimestamp(): Promise<string> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = `./reports/screenshots/confirmation_${timestamp}.png`;
        
        await browser.saveScreenshot(screenshotPath);
        console.log(`✓ Screenshot saved: ${screenshotPath}`);
        
        return screenshotPath;
    }

    /**
     * Verify transaction details are valid
     */
    public async verifyTransactionDetails(): Promise<PurchaseDetails> {
        const details = await this.getPurchaseDetails();
        
        // Verify transaction ID is not empty
        expect(details.transactionId).not.toBe('');
        expect(details.transactionId.length).toBeGreaterThan(0);
        
        // Verify status indicates success
        expect(details.status.toLowerCase()).toContain('success');
        
        // Verify amount format (should contain $ and be greater than 0)
        expect(details.amount).toMatch(/^\$\d+(\.\d{2})?$/);
        const amountValue = parseFloat(details.amount.replace('$', ''));
        expect(amountValue).toBeGreaterThan(0);
        
        console.log('✓ All transaction details are valid');
        
        return details;
    }

    /**
     * Get page title for validation
     */
    public async getPageTitle(): Promise<string> {
        return await browser.getTitle();
    }

    /**
     * Verify confirmation page elements are present
     */
    public async verifyPageElements(): Promise<boolean> {
        console.log('\n===== VERIFYING PAGE ELEMENTS =====');
        
        await expect(this.confirmationTitle).toBeDisplayed();
        console.log('✓ Confirmation title is displayed');
        
        await expect(this.purchaseDetails).toBeDisplayed();
        console.log('✓ Purchase details table is displayed');
        
        await expect(this.transactionId).toBeDisplayed();
        console.log('✓ Transaction ID is displayed');
        
        await expect(this.status).toBeDisplayed();
        console.log('✓ Status is displayed');
        
        await expect(this.amount).toBeDisplayed();
        console.log('✓ Amount is displayed');
        
        return true;
    }

    /**
     * Get full confirmation page text for debugging
     */
    public async getFullPageText(): Promise<string> {
        const bodyText = await $('body').getText();
        console.log('Full page text:', bodyText);
        return bodyText;
    }

    /**
     * Complete confirmation validation (combines all validations)
     */
    public async completeConfirmationValidation(): Promise<ConfirmationResult> {
        // Wait for page to load
        await this.waitForConfirmationPage();
        
        // Verify confirmation message
        await this.verifyPurchaseConfirmation();
        
        // Verify page elements
        await this.verifyPageElements();
        
        // Get and verify transaction details
        const details = await this.verifyTransactionDetails();
        
        // Capture screenshot
        const screenshotPath = await this.captureScreenshotWithTimestamp();
        
        console.log('\n===== CONFIRMATION VALIDATION COMPLETE =====');
        console.log('✓ All validations passed successfully');
        
        return {
            confirmed: true,
            details,
            screenshotPath
        };
    }
}

export default new ConfirmationPage();