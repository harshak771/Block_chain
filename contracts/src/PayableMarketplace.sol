// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayableRecipeMarketplace
 * @notice Example marketplace contract that can receive ETH payments
 * @dev This contract demonstrates proper payable functions for receiving ETH
 */
contract PayableRecipeMarketplace {
    // Event emitted when ETH is received
    event ETHReceived(address indexed sender, uint256 amount, bytes data);
    event RecipePurchased(address indexed buyer, uint256 indexed tokenId, uint256 price);

    // Mapping of recipe listings
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;

    /**
     * @notice Receive function - called when ETH is sent with no data
     * @dev This allows the contract to receive plain ETH transfers
     */
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value, "");
    }

    /**
     * @notice Fallback function - called when ETH is sent with data
     * @dev This handles any calls that don't match existing functions
     */
    fallback() external payable {
        emit ETHReceived(msg.sender, msg.value, msg.data);
    }

    /**
     * @notice List a recipe NFT for sale
     * @param tokenId The ID of the recipe NFT
     * @param price The price in wei
     */
    function listRecipe(uint256 tokenId, uint256 price) external {
        require(price > 0, "Price must be greater than 0");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            price: price,
            isActive: true
        });
    }

    /**
     * @notice Purchase a recipe NFT
     * @param tokenId The ID of the recipe to purchase
     * @dev This function is payable and will receive ETH
     */
    function buyRecipe(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];
        
        require(listing.isActive, "Recipe not listed for sale");
        require(msg.value >= listing.price, "Insufficient ETH sent");
        require(msg.sender != listing.seller, "Cannot buy your own recipe");

        // Mark as sold
        listing.isActive = false;

        // Transfer ETH to seller
        (bool success, ) = payable(listing.seller).call{value: listing.price}("");
        require(success, "ETH transfer to seller failed");

        // Refund excess ETH if any
        if (msg.value > listing.price) {
            uint256 refund = msg.value - listing.price;
            (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
            require(refundSuccess, "ETH refund failed");
        }

        emit RecipePurchased(msg.sender, tokenId, listing.price);
    }

    /**
     * @notice Unlist a recipe from sale
     * @param tokenId The ID of the recipe to unlist
     */
    function unlistRecipe(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Recipe not listed");

        listing.isActive = false;
    }

    /**
     * @notice Get listing details
     * @param tokenId The ID of the recipe
     * @return Listing details
     */
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    /**
     * @notice Withdraw contract balance (owner only)
     * @dev In production, add access control
     */
    function withdraw() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Get contract ETH balance
     * @return Contract balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
