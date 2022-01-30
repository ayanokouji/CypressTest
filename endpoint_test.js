//---------------------------------------------------------------------------------
//* WARNING DO NOT USE PERSONAL WIKIPEDIA ACCOUNT!!! *
//*  ALL WATCHLIST ITEMS WILL BE REMOVED! *

//Requires env variables userName and userPassword to be defined in cypress.json.
//cypress.json not included: Please use your own test account.
//userName should be a wikipedia account login
//userPassword should be the password to the wikipedia account

//Write tests for the Wikipedia page using Cypress that:
//
//    Add two pages to your watchlist
//    Removes one of the articles from your watchlist
//    Makes sure that the second article is still present in the watchlist
//    Goes to the article in the watchlist and makes sure that the title matches
//---------------------------------------------------------------------------------
context('EndpointTest', () => {

    //commonly used web elements
    const webroot = 'https://en.wikipedia.org';
    const editWatchlist = '/wiki/Special:EditWatchlist';
    const uiInputWidget = '.oo-ui-inputWidget-input';
    const uiInputWidgetLabel = '.oo-ui-inputWidget-input > .oo-ui-labelElement-label';
    
    //wiki wishlist items to be manipulated by tests
    const remainItem = 'Dog';
    const removeItem = 'Cat';
    
    //repeating actions used in tests. 
    //sacrificing repeat usability for readability by using const instead of parameters.
    Cypress.Commands.add("clearWatchlist", () => {
        cy.visit(webroot + editWatchlist + '/clear');
        cy.get(uiInputWidgetLabel).click();
    })
    
    Cypress.Commands.add("addItemsToWatchlist", () => {
        cy.visit(webroot + editWatchlist + '/raw');
        cy.get(uiInputWidget).first().type(removeItem + '\n' + remainItem);
        cy.get( uiInputWidgetLabel).click();
    })
    
    Cypress.Commands.add("RemoveItemFromWatchlist", () => {
        cy.visit(webroot + editWatchlist);
        cy.get(uiInputWidget).first().check();
        cy.get(uiInputWidget).last().click();
    })
    
    Cypress.Commands.add("getReminingItemWidgetOnWatchlist", (item) => {
        return cy.get("[href='/wiki/" + item + "']")
    })
    
    beforeEach(() => {
        //Using gui based login instead of session or other because I don't own the site and do not have time to design/investigate the wikipedia api.
        //uses login information stored in cypress.json
        cy.clearCookies();
        cy.visit(webroot + '/w/index.php?title=Special:UserLogin')
            .get('#wpName1')
            .type(Cypress.env('userName'))
            .get('#wpPassword1')
            .type(Cypress.env('userPassword'))
            .get('#wpLoginAttempt')
            .click();
    })
    
    afterEach(() => {
        //logout for clean session
        cy.visit(webroot + '/w/index.php?title=Special:UserLogout&returnto=Main+Page')
            .get(uiInputWidgetLabel)
            .click();
    })
    
    it('Add two pages to watchlist', () => {
        cy.clearWatchlist();
        cy.addItemsToWatchlist();
        
        //Assert: Check output result after adding items to watchlist
        cy.get('#mw-content-text').should('have.text', 'Your watchlist has been updated. 2 titles were added:\n' + removeItem + ' (talk)\n'+ remainItem + ' (talk)\n\nReturn to Special:Watchlist.\n\nRetrieved from "https://en.wikipedia.org/wiki/Special:EditWatchlist/raw"');
    })
    
    it('Remove item from watchlist', () => {
        cy.clearWatchlist();
        cy.addItemsToWatchlist();
        cy.RemoveItemFromWatchlist();
        
        //Assert: Inspect label output for exact text match
        cy.get('#mw-content-text').should('have.text', 'A single title was removed from your watchlist:\n' + removeItem + ' (talk)\n\nReturn to Special:Watchlist.\n\nRetrieved from "https://en.wikipedia.org/wiki/Special:EditWatchlist"');
    })
    
    it('confirm remaining item remains on watchlist', () => {
        cy.clearWatchlist();
        cy.addItemsToWatchlist();
        cy.RemoveItemFromWatchlist();
    
        //Assert: Inspect watchlist for remaining item
        cy.visit(webroot + editWatchlist);
        cy.getReminingItemWidgetOnWatchlist(remainItem).should('have.text', remainItem);
    })
    
    it('remove cat and navigate to remaining item from watchlist', () => {
        cy.clearWatchlist();
        cy.addItemsToWatchlist();
        cy.RemoveItemFromWatchlist();
    
        //Assert: Inspect page title for match with remaining item
        cy.visit(webroot + editWatchlist);
        cy.getReminingItemWidgetOnWatchlist(remainItem).click();
        cy.get('.firstHeading').should('have.text', remainItem);
    })
    })