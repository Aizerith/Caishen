import {expect, test} from '@playwright/test';
import {uniqueName} from './support/session';

test.describe('auth flow', () => {
  test('redirects unauthenticated users to login on protected route', async ({page}) => {
    await page.goto('/group');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', {name: 'Connexion'})).toBeVisible();
  });

  test('registers a user and opens the group page', async ({page}) => {
    const suffix = Date.now();
    const username = uniqueName('E2EUser').replaceAll(' ', '-');
    const email = `e2e-${suffix}@example.com`;
    const password = 'Admin123!';

    await page.goto('/register');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('mail@exemple.com').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByPlaceholder('Confirm password').fill(password);
    await page.getByRole('button', {name: 'Créer le compte'}).click();

    await expect(page).toHaveURL(/\/group$/);
    await expect(page.getByRole('heading', {name: 'Groupes'})).toBeVisible();
  });
});
