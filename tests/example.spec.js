import {test, expect} from '@playwright/test';

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
