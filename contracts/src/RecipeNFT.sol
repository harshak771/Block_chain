// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecipeNFT
 * @dev ERC721 NFT contract for Recipe NFTs with royalty support
 */
contract RecipeNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    
    uint256 private _tokenIdCounter;
    
    // Mapping from tokenId to IPFS hash
    mapping(uint256 => string) public recipeIPFSHashes;
    
    // Mapping from tokenId to recipe metadata
    mapping(uint256 => RecipeMetadata) public recipeMetadata;
    
    // Mapping from tokenId to creator royalty percentage (basis points, 100 = 1%)
    mapping(uint256 => uint16) public royaltyPercentages;
    
    // Mapping from tokenId to original creator address
    mapping(uint256 => address) public recipeCreators;
    
    // Mapping from tokenId to collaborators and their shares
    mapping(uint256 => mapping(address => uint256)) public collaboratorShares;
    
    // Mapping from tokenId to array of collaborators
    mapping(uint256 => address[]) public recipeCollaborators;
    
    struct RecipeMetadata {
        string name;
        string description;
        string cuisine;
        uint256 prepTime;
        uint256 cookTime;
        uint8 difficulty;
        uint256 servings;
        bool isPublic;
        uint256 createdAt;
    }
    
    event RecipeMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string ipfsHash,
        string recipeName
    );
    
    event RoyaltySet(uint256 indexed tokenId, uint16 percentage);
    
    event CollaboratorAdded(
        uint256 indexed tokenId,
        address indexed collaborator,
        uint256 share
    );
    
    event RecipeUpdated(
        uint256 indexed tokenId,
        address indexed updatedBy,
        string newIPFSHash
    );
    
    constructor() ERC721("RecipeNFT", "RECIPE") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new recipe NFT
     */
    function mintRecipe(
        string memory ipfsHash,
        string memory name,
        string memory description,
        string memory cuisine,
        uint256 prepTime,
        uint256 cookTime,
        uint8 difficulty,
        uint256 servings,
        uint16 royaltyPercentage
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        
        recipeIPFSHashes[tokenId] = ipfsHash;
        recipeCreators[tokenId] = msg.sender;
        royaltyPercentages[tokenId] = royaltyPercentage;
        
        recipeMetadata[tokenId] = RecipeMetadata({
            name: name,
            description: description,
            cuisine: cuisine,
            prepTime: prepTime,
            cookTime: cookTime,
            difficulty: difficulty,
            servings: servings,
            isPublic: true,
            createdAt: block.timestamp
        });
        
        // Initialize creator as first collaborator with 100% share
        recipeCollaborators[tokenId].push(msg.sender);
        collaboratorShares[tokenId][msg.sender] = 100;
        
        emit RecipeMinted(tokenId, msg.sender, ipfsHash, name);
        emit RoyaltySet(tokenId, royaltyPercentage);
        
        return tokenId;
    }
    
    /**
     * @dev Add a collaborator to a recipe
     */
    function addCollaborator(
        uint256 tokenId,
        address collaborator,
        uint256 sharePercentage
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can add collaborators");
        require(sharePercentage > 0 && sharePercentage <= 100, "Invalid share percentage");
        require(collaborator != address(0), "Invalid collaborator address");
        
        // Check if collaborator already exists
        bool exists = false;
        for (uint256 i = 0; i < recipeCollaborators[tokenId].length; i++) {
            if (recipeCollaborators[tokenId][i] == collaborator) {
                exists = true;
                collaboratorShares[tokenId][collaborator] = sharePercentage;
                break;
            }
        }
        
        if (!exists) {
            recipeCollaborators[tokenId].push(collaborator);
            collaboratorShares[tokenId][collaborator] = sharePercentage;
        }
        
        emit CollaboratorAdded(tokenId, collaborator, sharePercentage);
    }
    
    /**
     * @dev Update recipe IPFS hash (new version)
     */
    function updateRecipeIPFS(uint256 tokenId, string memory newIPFSHash) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can update recipe");
        recipeIPFSHashes[tokenId] = newIPFSHash;
        emit RecipeUpdated(tokenId, msg.sender, newIPFSHash);
    }
    
    /**
     * @dev Get recipe collaborators
     */
    function getCollaborators(uint256 tokenId) 
        public 
        view 
        returns (address[] memory) 
    {
        return recipeCollaborators[tokenId];
    }
    
    /**
     * @dev Get collaborator share for a recipe
     */
    function getCollaboratorShare(uint256 tokenId, address collaborator) 
        public 
        view 
        returns (uint256) 
    {
        return collaboratorShares[tokenId][collaborator];
    }
    
    /**
     * @dev Get recipe IPFS hash
     */
    function getRecipeIPFS(uint256 tokenId) 
        public 
        view 
        returns (string memory) 
    {
        return recipeIPFSHashes[tokenId];
    }
    
    /**
     * @dev Get recipe metadata
     */
    function getRecipeMetadata(uint256 tokenId) 
        public 
        view 
        returns (RecipeMetadata memory) 
    {
        return recipeMetadata[tokenId];
    }
    
    /**
     * @dev Get royalty information (ERC2981 standard)
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        public 
        view 
        returns (address receiver, uint256 royaltyAmount) 
    {
        uint256 royalty = (salePrice * royaltyPercentages[tokenId]) / 10000;
        return (recipeCreators[tokenId], royalty);
    }
    
    /**
     * @dev Get total recipes minted
     */
    function getTotalRecipes() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
