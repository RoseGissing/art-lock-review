// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ArtworkRating - Anonymous Artwork Rating System
/// @notice Allows judges to submit encrypted scores (1-10) for artworks
/// @dev Uses FHE to calculate average scores while keeping individual ratings anonymous
contract ArtworkRating is SepoliaConfig {
    struct Artwork {
        string title;
        address artist;
        euint32 encryptedTotalScore; // Sum of all encrypted scores
        euint32 encryptedCount; // Number of ratings (encrypted for privacy)
        uint256 ratingCount; // Plaintext count for verification
        bool exists;
    }

    mapping(uint256 => Artwork) private _artworks;
    mapping(uint256 => mapping(address => bool)) private _hasRated; // artworkId => judge => hasRated
    uint256 private _artworkCounter;

    event ArtworkCreated(uint256 indexed artworkId, address indexed artist, string title);
    event RatingSubmitted(uint256 indexed artworkId, address indexed judge);
    event AverageScoreDecrypted(uint256 indexed artworkId, uint256 averageScore);

    /// @notice Create a new artwork for rating
    /// @param title The title of the artwork
    /// @return artworkId The ID of the newly created artwork
    function createArtwork(string calldata title) external returns (uint256 artworkId) {
        artworkId = _artworkCounter++;
        
        // Create initial encrypted values
        euint32 initialTotal = FHE.asEuint32(0);
        euint32 initialCount = FHE.asEuint32(0);
        
        // Allow this contract to use these values for future operations
        FHE.allowThis(initialTotal);
        FHE.allowThis(initialCount);
        
        _artworks[artworkId] = Artwork({
            title: title,
            artist: msg.sender,
            encryptedTotalScore: initialTotal,
            encryptedCount: initialCount,
            ratingCount: 0,
            exists: true
        });

        emit ArtworkCreated(artworkId, msg.sender, title);
    }

    /// @notice Submit an encrypted rating (1-10) for an artwork
    /// @param artworkId The ID of the artwork to rate
    /// @param encryptedScore The encrypted score (must be between 1-10)
    /// @param inputProof The FHE input proof
    function submitRating(
        uint256 artworkId,
        externalEuint32 encryptedScore,
        bytes calldata inputProof
    ) external {
        require(_artworks[artworkId].exists, "Artwork does not exist");
        require(!_hasRated[artworkId][msg.sender], "Already rated this artwork");

        euint32 score = FHE.fromExternal(encryptedScore, inputProof);
        
        // Allow this contract to use the score
        FHE.allowThis(score);
        
        // Create new encrypted one for count increment
        euint32 one = FHE.asEuint32(1);
        FHE.allowThis(one);
        
        // Add to total and increment count
        euint32 newTotal = FHE.add(_artworks[artworkId].encryptedTotalScore, score);
        euint32 newCount = FHE.add(_artworks[artworkId].encryptedCount, one);
        
        // Allow this contract to use the new values
        FHE.allowThis(newTotal);
        FHE.allowThis(newCount);
        
        // Store the new values
        _artworks[artworkId].encryptedTotalScore = newTotal;
        _artworks[artworkId].encryptedCount = newCount;
        _artworks[artworkId].ratingCount++;

        _hasRated[artworkId][msg.sender] = true;

        emit RatingSubmitted(artworkId, msg.sender);
    }

    /// @notice Request decryption permission for an artwork's scores
    /// @param artworkId The ID of the artwork
    function requestDecryptionAccess(uint256 artworkId) external {
        require(_artworks[artworkId].exists, "Artwork does not exist");
        
        // Grant decryption permissions to the caller
        FHE.allow(_artworks[artworkId].encryptedTotalScore, msg.sender);
        FHE.allow(_artworks[artworkId].encryptedCount, msg.sender);
    }

    /// @notice Get artwork metadata
    /// @param artworkId The ID of the artwork
    /// @return title The title of the artwork
    /// @return artist The artist address
    /// @return ratingCount The number of ratings (plaintext)
    function getArtworkInfo(uint256 artworkId)
        external
        view
        returns (string memory title, address artist, uint256 ratingCount)
    {
        require(_artworks[artworkId].exists, "Artwork does not exist");
        Artwork storage artwork = _artworks[artworkId];
        return (artwork.title, artwork.artist, artwork.ratingCount);
    }

    /// @notice Get the encrypted total score for an artwork
    /// @param artworkId The ID of the artwork
    /// @return encryptedTotal The encrypted sum of all scores
    function getEncryptedTotalScore(uint256 artworkId)
        external
        view
        returns (euint32 encryptedTotal)
    {
        require(_artworks[artworkId].exists, "Artwork does not exist");
        return _artworks[artworkId].encryptedTotalScore;
    }

    /// @notice Get the encrypted count of ratings for an artwork
    /// @param artworkId The ID of the artwork
    /// @return encryptedCount The encrypted number of ratings
    function getEncryptedCount(uint256 artworkId)
        external
        view
        returns (euint32 encryptedCount)
    {
        require(_artworks[artworkId].exists, "Artwork does not exist");
        return _artworks[artworkId].encryptedCount;
    }

    /// @notice Check if a judge has already rated an artwork
    /// @param artworkId The ID of the artwork
    /// @param judge The judge address
    /// @return Whether the judge has rated this artwork
    function hasRated(uint256 artworkId, address judge) external view returns (bool) {
        return _hasRated[artworkId][judge];
    }

    /// @notice Get the total number of artworks
    /// @return count The total number of artworks created
    function getArtworkCount() external view returns (uint256 count) {
        return _artworkCounter;
    }
}

