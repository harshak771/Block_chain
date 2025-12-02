// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecipeMarketplace
 * @dev Marketplace for buying and selling Recipe NFTs with royalty support
 */
contract RecipeMarketplace is ReentrancyGuard, Ownable {
    
    IERC721 public recipeNFT;
    
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    uint256 public totalPlatformFees;
    
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
        uint256 listedAt;
    }
    
    struct Offer {
        address offerer;
        uint256 amount;
        uint256 expiresAt;
        bool isActive;
    }
    
    // Mapping from tokenId to listing
    mapping(uint256 => Listing) public listings;
    
    // Mapping from tokenId to offers
    mapping(uint256 => Offer[]) public offers;
    
    // Mapping from user to their balance (for withdrawals)
    mapping(address => uint256) public userBalances;
    
    event RecipeListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    
    event RecipeUnlisted(uint256 indexed tokenId, address indexed seller);
    
    event RecipeSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event OfferMade(
        uint256 indexed tokenId,
        address indexed offerer,
        uint256 amount,
        uint256 expiresAt
    );
    
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed offerer,
        uint256 amount
    );
    
    event OfferCancelled(uint256 indexed tokenId, uint256 offerIndex);
    
    event PlatformFeeWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address _recipeNFT) Ownable(msg.sender) {
        recipeNFT = IERC721(_recipeNFT);
    }
    
    /**
     * @dev List a recipe NFT for sale
     */
    function listRecipe(uint256 tokenId, uint256 price) public nonReentrant {
        require(recipeNFT.ownerOf(tokenId) == msg.sender, "Only owner can list");
        require(price > 0, "Price must be greater than 0");
        
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });
        
        emit RecipeListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Unlist a recipe NFT
     */
    function unlistRecipe(uint256 tokenId) public nonReentrant {
        require(listings[tokenId].seller == msg.sender, "Only seller can unlist");
        require(listings[tokenId].isActive, "Listing is not active");
        
        listings[tokenId].isActive = false;
        
        emit RecipeUnlisted(tokenId, msg.sender);
    }
    
    /**
     * @dev Buy a listed recipe NFT
     */
    function buyRecipe(uint256 tokenId) public payable nonReentrant {
        Listing memory listing = listings[tokenId];
        
        require(listing.isActive, "Recipe is not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        
        address seller = listing.seller;
        require(recipeNFT.ownerOf(tokenId) == seller, "NFT ownership mismatch");
        
        // Calculate fees
        uint256 platformFee = (listing.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Update balances
        userBalances[seller] += sellerAmount;
        totalPlatformFees += platformFee;
        
        // Handle overpayment
        if (msg.value > listing.price) {
            userBalances[msg.sender] += (msg.value - listing.price);
        }
        
        // Deactivate listing
        listings[tokenId].isActive = false;
        
        // Transfer NFT (requires approval from seller)
        recipeNFT.transferFrom(seller, msg.sender, tokenId);
        
        emit RecipeSold(tokenId, seller, msg.sender, listing.price);
    }
    
    /**
     * @dev Make an offer on a recipe NFT
     */
    function makeOffer(
        uint256 tokenId,
        uint256 expiresIn
    ) public payable nonReentrant {
        require(msg.value > 0, "Offer amount must be greater than 0");
        require(expiresIn > 0, "Expiration time must be greater than 0");
        
        uint256 expiresAt = block.timestamp + expiresIn;
        
        Offer memory newOffer = Offer({
            offerer: msg.sender,
            amount: msg.value,
            expiresAt: expiresAt,
            isActive: true
        });
        
        offers[tokenId].push(newOffer);
        
        emit OfferMade(tokenId, msg.sender, msg.value, expiresAt);
    }
    
    /**
     * @dev Accept an offer on a recipe NFT
     */
    function acceptOffer(uint256 tokenId, uint256 offerIndex) public nonReentrant {
        require(recipeNFT.ownerOf(tokenId) == msg.sender, "Only owner can accept offer");
        require(offerIndex < offers[tokenId].length, "Invalid offer index");
        
        Offer memory offer = offers[tokenId][offerIndex];
        
        require(offer.isActive, "Offer is not active");
        require(block.timestamp <= offer.expiresAt, "Offer has expired");
        
        // Calculate fees
        uint256 platformFee = (offer.amount * platformFeePercentage) / 10000;
        uint256 sellerAmount = offer.amount - platformFee;
        
        // Update balances
        userBalances[msg.sender] += sellerAmount;
        totalPlatformFees += platformFee;
        
        // Deactivate offer
        offers[tokenId][offerIndex].isActive = false;
        
        // Transfer NFT
        recipeNFT.transferFrom(msg.sender, offer.offerer, tokenId);
        
        // Transfer funds to seller
        (bool success, ) = msg.sender.call{value: sellerAmount}("");
        require(success, "Transfer failed");
        
        // Deactivate any listing
        if (listings[tokenId].isActive) {
            listings[tokenId].isActive = false;
        }
        
        emit OfferAccepted(tokenId, offer.offerer, offer.amount);
    }
    
    /**
     * @dev Cancel an offer
     */
    function cancelOffer(uint256 tokenId, uint256 offerIndex) public nonReentrant {
        require(offerIndex < offers[tokenId].length, "Invalid offer index");
        
        Offer memory offer = offers[tokenId][offerIndex];
        
        require(offer.offerer == msg.sender, "Only offerer can cancel");
        require(offer.isActive, "Offer is not active");
        
        // Deactivate offer
        offers[tokenId][offerIndex].isActive = false;
        
        // Refund offer amount
        (bool success, ) = msg.sender.call{value: offer.amount}("");
        require(success, "Refund failed");
        
        emit OfferCancelled(tokenId, offerIndex);
    }
    
    /**
     * @dev Get all active offers for a recipe
     */
    function getActiveOffers(uint256 tokenId) 
        public 
        view 
        returns (Offer[] memory) 
    {
        Offer[] memory activeOffers = new Offer[](offers[tokenId].length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < offers[tokenId].length; i++) {
            if (offers[tokenId][i].isActive && block.timestamp <= offers[tokenId][i].expiresAt) {
                activeOffers[count] = offers[tokenId][i];
                count++;
            }
        }
        
        // Resize array
        Offer[] memory result = new Offer[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeOffers[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get user balance
     */
    function getUserBalance(address user) public view returns (uint256) {
        return userBalances[user];
    }
    
    /**
     * @dev Withdraw user balance
     */
    function withdrawBalance() public nonReentrant {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        userBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() public onlyOwner nonReentrant {
        uint256 fees = totalPlatformFees;
        require(fees > 0, "No fees to withdraw");
        
        totalPlatformFees = 0;
        
        (bool success, ) = msg.sender.call{value: fees}("");
        require(success, "Fee withdrawal failed");
        
        emit PlatformFeeWithdrawn(msg.sender, fees);
    }
    
    /**
     * @dev Set platform fee percentage (basis points)
     */
    function setPlatformFeePercentage(uint256 newFeePercentage) public onlyOwner {
        require(newFeePercentage <= 1000, "Fee percentage too high (max 10%)");
        platformFeePercentage = newFeePercentage;
    }
    
    /**
     * @dev Get listing for a recipe
     */
    function getListing(uint256 tokenId) 
        public 
        view 
        returns (Listing memory) 
    {
        return listings[tokenId];
    }
}
