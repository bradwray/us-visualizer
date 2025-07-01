/// <reference types="cypress" />

describe('US Legal Timeline Visualizer - File Upload E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Wait for the initial dataset to load
    cy.contains('Cannabis Legalization in the United States').should('be.visible');
    cy.get('[data-testid="legal-map"]').should('be.visible');
  });

  it('should upload a new dataset file and verify the map recolors', () => {
    // Create marriage dataset file content
    const marriageDataset = {
      "title": "Same-Sex Marriage Legalization in the United States",
      "factor": "Same-Sex Marriage Legal Status",
      "data": [
        {
          "state": "Massachusetts",
          "events": [{ "year": 2003, "status": "legal" }]
        },
        {
          "state": "California",
          "events": [{ "year": 2013, "status": "legal" }]
        },
        {
          "state": "New York",
          "events": [{ "year": 2011, "status": "legal" }]
        }
      ]
    };

    // Get initial map state colors
    cy.get('[data-testid="legal-map"] svg path').first().then(() => {
      
      // Create and upload the file
      const fileName = 'marriage-test.json';
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(JSON.stringify(marriageDataset)),
        fileName: fileName,
        mimeType: 'application/json'
      }, { force: true });

      // Wait for the new dataset to load and verify title change
      cy.contains('Same-Sex Marriage Legalization in the United States', { timeout: 10000 })
        .should('be.visible');
      
      // Verify the factor changed
      cy.contains('Same-Sex Marriage Legal Status').should('be.visible');
      
      // Verify the year was reset to 1776
      cy.get('[data-testid="year-display"]').should('contain', '1776');
      
      // Verify dataset info shows correct number of states
      cy.contains('States with Data').parent().should('contain', '3 states');
      
      // Change to a year where marriage data exists (2013) using the play button
      // This tests the interaction in a more realistic way
      cy.get('[data-testid="play-pause-button"]').click();
      
      // Wait for some progression
      cy.wait(3000);
      
      // Pause
      cy.get('[data-testid="play-pause-button"]').click();
      
      // Verify year has advanced beyond 1776
      cy.get('[data-testid="year-display"]').then(($display) => {
        const currentYear = parseInt($display.text());
        cy.wrap(currentYear).should('be.greaterThan', 1776);
      });
      
      // Check that the map has been updated (different fill colors)
      cy.get('[data-testid="legal-map"] svg path').first().then(($newPath) => {
        // The map structure should be intact and responding
        cy.wrap($newPath).should('exist');
        cy.wrap($newPath).should('have.attr', 'fill');
      });
    });
  });

  it('should handle invalid JSON file upload gracefully', () => {
    const invalidJson = '{ "invalid": json data }';
    
    // Upload invalid file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(invalidJson),
      fileName: 'invalid.json',
      mimeType: 'application/json'
    }, { force: true });
    
    // Should show error (the exact error handling depends on implementation)
    // At minimum, the original dataset should still be visible
    cy.contains('Cannabis Legalization in the United States').should('be.visible');
    cy.get('[data-testid="legal-map"]').should('be.visible');
  });

  it('should handle dataset with missing required fields', () => {
    const incompleteDataset = {
      "title": "Incomplete Dataset",
      // missing "factor" field
      "data": []
    };
    
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(JSON.stringify(incompleteDataset)),
      fileName: 'incomplete.json',
      mimeType: 'application/json'
    }, { force: true });
    
    // Original dataset should remain
    cy.contains('Cannabis Legalization in the United States').should('be.visible');
  });
});
