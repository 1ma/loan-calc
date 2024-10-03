import {test, expect} from '@playwright/test';

const DEBOUNCE_DELAY = 210;

test('smoke test with default values', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('input#loanAmountLabel')).toHaveValue('12000');
    await expect(page.locator('input#interestRateLabel')).toHaveValue('2.5');
    await expect(page.locator('input#loanPeriodLabel')).toHaveValue('10');
    await expect(page.locator('select#loanPeriodType option:checked')).toHaveText('Years');
    await expect(page.locator('input#monthlyFeeLabel')).toHaveValue('0');
    await expect(page.locator('input#startingFeeLabel')).toHaveValue('0');
    await expect(page.locator('[js-total-payments]')).toHaveText('13,574.87');

    await page.getByText('Table', {exact: true}).click();
    await expect(page.locator('[js-breakdown-items] > div')).toHaveCount(120);
    await expect(page.locator('[js-breakdown-items] > div:first-child')).toContainText("25.00€");
    await expect(page.locator('[js-breakdown-items] > div:last-child')).toContainText("0.24€");
});

test('test editing the loan duration', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('input[js-loan-period-value]')).toHaveValue('10');
    await expect(page.locator('[js-total-payments]')).toHaveText('13,574.87');

    await page.locator('input#loanPeriodLabel').fill('20');
    await page.waitForTimeout(DEBOUNCE_DELAY);

    await expect(page.locator('input[js-loan-period-value]')).toHaveValue('20');
    await expect(page.locator('[js-total-payments]')).toHaveText('15,261.20');
});

test('test editing the loan amount', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('input[js-loan-amount-value]')).toHaveValue('12000');
    await expect(page.locator('[js-total-payments]')).toHaveText('13,574.87');

    await page.locator('input[js-loan-amount-value]').fill('150000');
    await page.waitForTimeout(DEBOUNCE_DELAY);

    await expect(page.locator('input[js-loan-amount-value]')).toHaveValue('150000');
    await expect(page.locator('[js-total-payments]')).toHaveText('169,685.82');
});

test('test editing the interest rate', async ({page}) => {
    await page.goto('/');
    await expect(page.locator('input[js-interest-value]')).toHaveValue('2.5');
    await expect(page.locator('[js-total-payments]')).toHaveText('13,574.87');

    await page.locator('input[js-interest-value]').fill('3.25');
    await page.waitForTimeout(DEBOUNCE_DELAY);

    await expect(page.locator('input[js-interest-value]')).toHaveValue('3.25');
    await expect(page.locator('[js-total-payments]')).toHaveText('14,071.54');
});
