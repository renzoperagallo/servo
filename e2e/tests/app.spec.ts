import { test, expect } from '@playwright/test';

test.describe('Servo App', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Servo');
    await expect(page.locator('text=Control de Gastos Mensuales')).toBeVisible();
  });

  test('should navigate to expense items', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Items');
    await expect(page).toHaveURL('/items');
    await expect(page.locator('h1')).toContainText('Items de Gasto');
  });

  test('should navigate to expenses', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Gastos');
    await expect(page).toHaveURL('/expenses');
    await expect(page.locator('h1')).toContainText('Gastos');
  });

  test('should navigate to reports', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Reportes');
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('h1')).toContainText('Reportes');
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Config');
    await expect(page).toHaveURL('/settings');
    await expect(page.locator('h1')).toContainText('Configuración');
  });
});

test.describe('Expense Items', () => {
  test('should create a new expense item', async ({ page }) => {
    await page.goto('/items');
    await page.click('text=+ Nuevo');
    
    await page.fill('input[placeholder="Ej: Supermercado"]', 'Test Item');
    await page.fill('input[placeholder="100000"]', '50000');
    await page.click('text=Crear');
    
    await expect(page.locator('text=Test Item')).toBeVisible();
    await expect(page.locator('text=$50.000')).toBeVisible();
  });

  test('should delete an expense item', async ({ page }) => {
    await page.goto('/items');
    
    const item = page.locator('text=Test Item').first();
    if (await item.isVisible()) {
      await item.locator('..').locator('button:has-text("🗑️")').click();
      page.on('dialog', dialog => dialog.accept());
      await expect(page.locator('text=Test Item')).not.toBeVisible();
    }
  });
});

test.describe('Expenses', () => {
  test('should create a new expense', async ({ page }) => {
    await page.goto('/expenses');
    await page.click('text=+ Nuevo');
    
    await page.selectOption('select', { index: 1 });
    await page.fill('input[placeholder="25000"]', '15000');
    await page.fill('input[placeholder="Ej: Compra semanal"]', 'Test expense');
    await page.click('text=Registrar');
    
    await expect(page.locator('text=Test expense')).toBeVisible();
  });
});

test.describe('Settings', () => {
  test('should update cycle settings', async ({ page }) => {
    await page.goto('/settings');
    
    const startInput = page.locator('input[type="number"]').first();
    const endInput = page.locator('input[type="number"]').last();
    
    await startInput.fill('5');
    await endInput.fill('25');
    await page.click('text=Guardar Configuración');
    
    await expect(page.locator('text=Del día 5 al día 25')).toBeVisible();
  });
});
