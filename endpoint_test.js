//---------------------------------------------------------------------------------
//* WARNING DO NOT USE PERSONAL WIKIPEDIA ACCOUNT!!! *
//*  ALL WATCHLIST ITEMS WILL BE REMOVED! *

//Requires env variables userName and userPassword to be defined in cypress.json.
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
    const webroot = 'https://en.wikipedia.org'
    
    Cypress.Commands.add("clear_watchlist", (label) => {
        cy.visit(webroot + '/wiki/Special:EditWatchlist/clear');
        cy.get(label).click();
    })
    
    Cypress.Commands.add("add_catdog_to_watchlist", (input) => {
        cy.visit(webroot + '/wiki/Special:EditWatchlist/raw');
        cy.get(input).first().type('cat\ndog');
        cy.get( input + ' > .oo-ui-labelElement-label').click();
    })
    
    Cypress.Commands.add("remove_cat_from_watchlist", (input) => {
        cy.visit(webroot + '/wiki/Special:EditWatchlist');
        cy.get(input).first().check();
        cy.get(input).last().click();
    })
    
    beforeEach(() => {
        //Using gui based login instead of session or other because I don't own the site and do not have time to design/investigate the wikipedia api.
        //uses login information stored in cypress.json
        cy.clearCookies()
        cy.visit('https://en.wikipedia.org/w/index.php?title=Special:UserLogin')
            .get('#wpName1')
            .type(Cypress.env('userName'))
            .get('#wpPassword1')
            .type(Cypress.env('userPassword'))
            .get('#wpLoginAttempt')
            .click();
    })
    
    afterEach(() => {
        //logout for clean session
        cy.visit('https://en.wikipedia.org/w/index.php?title=Special:UserLogout&returnto=Main+Page')
            .get('.oo-ui-inputWidget-input > .oo-ui-labelElement-label')
            .click();
    })
    
    it('Add two pages, cat and dog, to watchlist', () => {
        cy.clear_watchlist('.oo-ui-inputWidget-input > .oo-ui-labelElement-label');
        cy.add_catdog_to_watchlist('.oo-ui-inputWidget-input');
        
        //Assert
        cy.get('#mw-content-text').should('have.text', 'Your watchlist has been updated. 2 titles were added:\nCat (talk)\nDog (talk)\n\nReturn to Special:Watchlist.\n\nRetrieved from "https://en.wikipedia.org/wiki/Special:EditWatchlist/raw"');
    })
    
    it('Remove cat item from watchlist', () => {
        cy.clear_watchlist('.oo-ui-inputWidget-input > .oo-ui-labelElement-label');
        cy.add_catdog_to_watchlist('.oo-ui-inputWidget-input');
        cy.remove_cat_from_watchlist('.oo-ui-inputWidget-input');
        
        //Assert
        cy.get('#mw-content-text').should('have.text', 'A single title was removed from your watchlist:\nCat (talk)\n\nReturn to Special:Watchlist.\n\nRetrieved from "https://en.wikipedia.org/wiki/Special:EditWatchlist"');
    })
    
    it('confirm dog item remains on watchlist', () => {
        cy.clear_watchlist('.oo-ui-inputWidget-input > .oo-ui-labelElement-label');
        cy.add_catdog_to_watchlist('.oo-ui-inputWidget-input');
        cy.remove_cat_from_watchlist('.oo-ui-inputWidget-input');
    
        //Assert
        cy.visit('https://en.wikipedia.org/wiki/Special:EditWatchlist');
        cy.get('.oo-ui-inputWidget-input').first().should('have.value', 'Dog');
    })
    
    it('remove cat and navigate to dog from watchlist', () => {
        cy.clear_watchlist('.oo-ui-inputWidget-input > .oo-ui-labelElement-label');
        cy.add_catdog_to_watchlist('.oo-ui-inputWidget-input');
        cy.remove_cat_from_watchlist('.oo-ui-inputWidget-input');
    
        //Assert
        cy.visit('https://en.wikipedia.org/wiki/Special:EditWatchlist');
        cy.get('[href="/wiki/Dog"]').click();
        cy.get('.firstHeading').should('have.text', 'Dog');
    })
    })