import { test, expect } from '@playwright/test';

test.describe('APT Website UI Tests', () => {
  test('should load the home page successfully', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Check that key elements are present
    await expect(page.locator('h1, [data-style]')).toBeVisible();
    
    // Check for navigation elements
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
    
    // Check for "Book a Session" or "Meet the Crew" buttons
    const bookButton = page.getByRole('link', { name: /book|session|appointment/i });
    await expect(bookButton.first()).toBeVisible();
    
    // Check for artist grid/section
    const artistsSection = page.getByText(/meet the crew|artists/i);
    await expect(artistsSection.first()).toBeVisible();
    
    // Check for hours section
    const hoursSection = page.getByText(/hours/i);
    await expect(hoursSection).toBeVisible();
    
    // Check for location section
    const locationSection = page.getByText(/location/i);
    await expect(locationSection).toBeVisible();
  });

  test('should allow smooth navigation through the gallery', async ({ page }) => {
    // Navigate to gallery page
    await page.goto('/gallery');
    
    // Check gallery page loaded
    await expect(page.getByRole('heading', { name: /gallery/i })).toBeVisible();
    
    // Check if there are gallery items
    const galleryItems = page.locator('img[src*="/tattoos/"], img[src*="/work/"]');
    const itemCount = await galleryItems.count();
    
    if (itemCount > 0) {
      // Click on the first gallery item
      await galleryItems.first().click();
      
      // Check if modal or detail page opened
      // The gallery uses links to artist pages, so we should navigate
      await page.waitForLoadState('networkidle');
      
      // Verify we're on an artist page or modal opened
      const isArtistPage = page.url().includes('/artists/');
      const hasModal = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
      
      expect(isArtistPage || hasModal).toBeTruthy();
      
      // If modal opened, close it and continue
      if (hasModal) {
        const closeButton = page.getByRole('button', { name: /close/i }).or(page.locator('[aria-label*="close" i]'));
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
        }
      }
      
      // Navigate back to gallery
      if (isArtistPage) {
        await page.goto('/gallery');
      }
      
      // Verify gallery is still accessible
      await expect(page.getByRole('heading', { name: /gallery/i })).toBeVisible();
    } else {
      // If no items, check for empty state message
      await expect(page.getByText(/no gallery|add tattoos/i)).toBeVisible();
    }
  });

  test('should handle photo upload and display correctly', async ({ page }) => {
    // Navigate to appointments/booking page
    await page.goto('/appointments');
    
    // Check that the booking form is present
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Fill in required form fields
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="contact"]', 'test@example.com');
    
    // Select an artist
    const artistSelect = page.locator('select[name="artistSlug"]');
    if (await artistSelect.isVisible()) {
      await artistSelect.selectOption({ index: 1 }); // Select first available artist
    }
    
    await page.fill('input[name="placement"]', 'Forearm');
    await page.fill('input[name="size"]', '4x6 inches');
    await page.fill('textarea[name="styleNotes"]', 'Test tattoo description');
    
    // Handle file upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Create a test image file (1x1 pixel PNG)
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      
      // Upload the test image
      await fileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      });
      
      // Verify file was selected (check if input shows filename or similar)
      const fileName = await fileInput.evaluate((el: HTMLInputElement) => el.files?.[0]?.name);
      expect(fileName).toBeTruthy();
    }
    
    // Note: We won't actually submit the form in the test to avoid creating real data
    // But we can verify the form is ready to submit
    const submitButton = page.getByRole('button', { name: /submit|request/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should navigate to artist profile pages', async ({ page }) => {
    // Navigate to artists page
    await page.goto('/artists');
    
    // Check artists page loaded
    await expect(page.getByRole('heading', { name: /artists|crew/i })).toBeVisible();
    
    // Find and click on an artist card
    const artistLinks = page.locator('a[href*="/artists/"]');
    const linkCount = await artistLinks.count();
    
    if (linkCount > 0) {
      const firstArtistLink = artistLinks.first();
      const artistHref = await firstArtistLink.getAttribute('href');
      
      await firstArtistLink.click();
      
      // Verify we navigated to artist profile
      await page.waitForURL(`**${artistHref}**`);
      
      // Check artist profile elements
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for portfolio section
      const portfolioSection = page.getByText(/portfolio/i);
      await expect(portfolioSection).toBeVisible();
    }
  });

  test('should display about page correctly', async ({ page }) => {
    // Navigate to about page
    await page.goto('/about');
    
    // Check about page loaded
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
    
    // Check for main content
    const aboutContent = page.getByText(/addictive pain tattoo/i);
    await expect(aboutContent).toBeVisible();
    
    // Check for CTA button
    const ctaButton = page.getByRole('link', { name: /request appointment/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should handle responsive navigation', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that navigation is accessible (may be hamburger menu)
    const nav = page.locator('nav, [aria-label*="menu" i], button[aria-label*="menu" i]');
    await expect(nav.first()).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Check navigation links are visible
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
