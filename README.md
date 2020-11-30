OLAN Auctions is a lightweight auctions web application where the user can place an item for auction, bid on items and close auctions. It has 5 models.

FUNCTIONALITIES
Active Listing -> The user can view all active listings.
Sort Listings -> The user can sort listings in various ways; by price and when updated.
Create listing -> The user can create new listings/ items for auction.
Categories -> The user can view all categories and all listings of each item.
Watchlist -> The user can add active items to a watchlist. The user can also remove items from the watchlist.
Won Listings -> If the user wins an auction; the last bidder when the auction is closed, the item is added to the 'Won Listings' template.
Comment -> The user can comment on all active listings.
Search -> The user can search for active listings.


FILES

LAYOUT.HTML
This file contains the layout of all the views; the navigation bar and the footer.

INDEX.HTML
This template displays all active listings.

CATEGORIES.HTML
This template displays all categories.

CATEGORY.HTML
This template displays all listings for each category.

CREATELISTING.HTML
This template allows the user add a new listing.

LISTING.HTML
This template displays details for each listing. The user can place bids on items, add items to the watchlist and remove items from the watchlist. The user can also comment on listings.

WATCHLIST.HTML
This template displays all listings in the user's watchlist.

WONLISTINGS.HTML
This template displays all listings the user has won.

AUCTIONS.JS
Contains all the JS code for the application.

STYLES.CSS
Contains all CSS styling.