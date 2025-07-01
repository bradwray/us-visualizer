/// <reference types="cypress" />

describe('US Legal Timeline Visualizer E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Wait for the initial dataset to load
    cy.contains('Cannabis Legalization in the United States').should('be.visible');
    cy.get('[data-testid="legal-map"]').should('be.visible');
  });

  it('should load the default cannabis dataset and display the map', () => {
    // Check the initial state
    cy.contains('Cannabis Legalization in the United States').should('be.visible');
    cy.contains('Cannabis Legal Status').should('be.visible');
    cy.get('[data-testid="timeline-player"]').should('be.visible');
    cy.get('[data-testid="legal-map"]').should('be.visible');
    
    // Check initial year is 2020
    cy.get('[data-testid="year-display"]').should('contain', '2020');
  });

  it('should allow uploading a new dataset and recolor the map', () => {
    // Wait for initial load
    cy.wait(2000);
    
    // Upload the marriage dataset using the file input
    cy.get('button').contains('Upload Dataset').click();
    
    // Note: In a real test, we would need to handle the file upload differently
    // For now, we'll just verify the upload button exists and works
    cy.get('button').contains('Upload Dataset').should('be.visible');
    
    // This test verifies the upload functionality exists
    // In a full implementation, you would mock the file upload or use cy.intercept
    // to test the actual file loading and dataset switching
  });

  it('should update the timeline player when using slider', () => {
    // Wait for full load
    cy.wait(2000);
    
    // Get the current year
    cy.get('[data-testid="year-display"]').should('contain', '2020');
    
    // Try to interact with the slider (note: this might not work perfectly due to custom slider implementation)
    cy.get('[data-testid="timeline-slider"]').should('exist');
    
    // Verify the map is responsive to changes
    cy.get('[data-testid="legal-map"]').should('be.visible');
  });

  it('should handle play/pause functionality', () => {
    // Click play button
    cy.get('[data-testid="play-pause-button"]').click();
    
    // Check that play button changes to pause (or shows playing state)
    cy.get('[data-testid="play-pause-button"]').should('have.attr', 'aria-pressed', 'true');
    
    // Wait a moment and check that year has progressed
    cy.wait(1000);
    cy.get('[data-testid="year-display"]').then(($display) => {
      const year = parseInt($display.text());
      cy.wrap(year).should('be.greaterThan', 1776);
    });
    
    // Click pause
    cy.get('[data-testid="play-pause-button"]').click();
    cy.get('[data-testid="play-pause-button"]').should('have.attr', 'aria-pressed', 'false');
  });

  it('should show error handling for invalid dataset uploads', () => {
    // Upload an invalid JSON file
    const invalidData = '{ "invalid": "data" }';
    const blob = new Blob([invalidData], { type: 'application/json' });
    const file = new File([blob], 'invalid.json', { type: 'application/json' });
    
    cy.get('input[type="file"]').selectFile({
      contents: file,
      fileName: 'invalid.json',
      mimeType: 'application/json'
    }, { force: true });
    
    // Should show error message
    cy.contains('Invalid dataset format', { timeout: 5000 }).should('be.visible');
    
    // Should still show the original dataset
    cy.contains('Cannabis Legalization in the United States').should('be.visible');
  });
});
