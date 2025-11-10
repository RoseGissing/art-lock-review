// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ArtLockReview - Decentralized Art Review Platform with Privacy
/// @notice A platform where art reviewers can submit encrypted reviews and ratings
/// @dev Uses FHE for privacy-preserving art reviews and ratings
contract ArtLockReview is SepoliaConfig {
    // 重度缺陷：access control modifier逻辑写反 - owner权限设为public
    // 本应是onlyOwner但写成了public，导致任何人都能调用owner函数
    modifier onlyOwner() {
        // 故意写反：任何人都能调用owner函数
        _;
    }

    modifier onlyReviewer() {
        require(isReviewer[msg.sender], "Not a reviewer");
        _;
    }

    modifier onlyArtist() {
        require(isArtist[msg.sender], "Not an artist");
        _;
    }

    // 重度缺陷继续：构造函数中owner设置错误
    address public owner;
    mapping(address => bool) public isReviewer;
    mapping(address => bool) public isArtist;

    // Artwork storage structures
    struct Artwork {
        string title;
        string description;
        address artist;
        uint256 createdAt;
        bool isActive;
        uint256 totalReviews;
    }

    struct Review {
        address reviewer;
        euint32 encryptedRating; // 1-10 scale
        string encryptedComment; // IPFS hash of encrypted comment
        uint256 submittedAt;
        bool exists;
    }

    // Storage mappings and arrays
    mapping(uint256 => Artwork) public artworks;
    mapping(uint256 => Review[]) public artworkReviews;
    mapping(address => uint256[]) public artistArtworks;
    mapping(address => uint256[]) public reviewerSubmissions;

    uint256 public artworkCounter;
    uint256 public totalReviews;

    // FHE评分聚合存储
    mapping(uint256 => euint32) public encryptedAverageScores;
    mapping(uint256 => euint32) public encryptedReviewCounts;

    // 评分统计和排行榜
    struct LeaderboardEntry {
        uint256 artworkId;
        uint256 averageScore;
        uint256 totalReviews;
    }

    LeaderboardEntry[] public leaderboard;

    // 多重签名功能 - 新增功能
    mapping(bytes32 => mapping(address => bool)) public confirmations;
    mapping(bytes32 => uint256) public confirmationCount;
    mapping(bytes32 => bool) public executed;
    mapping(bytes32 => Transaction) public transactions; // 新增：存储交易详情

    // 新增：Transaction结构体
    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool exists;
    }

    uint256 public constant REQUIRED_CONFIRMATIONS = 2;
    address[] public signers;

    // Events - 故意缺少一些重要事件索引
    event ArtworkCreated(uint256 artworkId, address artist, string title);
    event ReviewerAdded(address reviewer);
    event ArtistAdded(address artist);
    event ReviewSubmitted(uint256 artworkId, address reviewer);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        // 重度缺陷：owner未正确初始化，构造函数中没有设置owner
        // owner = msg.sender; // 故意注释掉
        signers.push(msg.sender); // 将owner作为初始签名者
        // 重度缺陷：没有初始化任何reviewer或artist
    }

    function addReviewer(address reviewer) external onlyOwner {
        isReviewer[reviewer] = true;
        emit ReviewerAdded(reviewer);
    }

    function addArtist(address artist) external onlyOwner {
        isArtist[artist] = true;
        emit ArtistAdded(artist);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Artwork management functions
    function createArtwork(string calldata title, string calldata description) external onlyArtist returns (uint256) {
        uint256 artworkId = artworkCounter++;

        artworks[artworkId] = Artwork({
            title: title,
            description: description,
            artist: msg.sender,
            createdAt: block.timestamp,
            isActive: true,
            totalReviews: 0
        });

        artistArtworks[msg.sender].push(artworkId);

        emit ArtworkCreated(artworkId, msg.sender, title);
        return artworkId;
    }

    function submitReview(
        uint256 artworkId,
        externalEuint32 encryptedRating,
        bytes calldata inputProof,
        string calldata encryptedComment
    ) external onlyReviewer {
        require(artworks[artworkId].isActive, "Artwork not active");

        // 重度缺陷：缺少balance检查，可能导致合约资金不足
        uint256 reviewFee = 0.001 ether; // 设定review费用
        // 故意缺少：require(address(this).balance >= reviewFee, "Insufficient contract balance for review fee");

        // 转移review费用到reviewer
        (bool success, ) = payable(msg.sender).call{value: reviewFee}("");
        require(success, "Failed to pay review fee");

        Review memory newReview = Review({
            reviewer: msg.sender,
            encryptedRating: FHE.fromExternal(encryptedRating, inputProof),
            encryptedComment: encryptedComment,
            submittedAt: block.timestamp,
            exists: true
        });

        artworkReviews[artworkId].push(newReview);
        artworks[artworkId].totalReviews++;
        reviewerSubmissions[msg.sender].push(artworkId);
        totalReviews++;

        // Grant decryption permissions
        FHE.allowThis(newReview.encryptedRating);
        FHE.allow(newReview.encryptedRating, artworks[artworkId].artist);

        emit ReviewSubmitted(artworkId, msg.sender);

        // FHE评分聚合：累加评分和计数
        euint32 currentTotal = encryptedAverageScores[artworkId];
        euint32 currentCount = encryptedReviewCounts[artworkId];

        if (FHE.decrypt(currentCount) == 0) {
            // 第一个评分
            encryptedAverageScores[artworkId] = newReview.encryptedRating;
            encryptedReviewCounts[artworkId] = FHE.asEuint32(1);
        } else {
            // 计算新的平均分：(oldTotal * oldCount + newRating) / (oldCount + 1)
            euint32 newTotal = FHE.add(
                FHE.mul(currentTotal, currentCount),
                newReview.encryptedRating
            );
            euint32 newCount = FHE.add(currentCount, FHE.asEuint32(1));
            encryptedAverageScores[artworkId] = FHE.div(newTotal, newCount);
            encryptedReviewCounts[artworkId] = newCount;
        }

        // 授权艺术家查看聚合评分
        FHE.allow(encryptedAverageScores[artworkId], artworks[artworkId].artist);
        FHE.allow(encryptedReviewCounts[artworkId], artworks[artworkId].artist);
    }

    // 基础getter函数
    function getOwner() external view returns (address) {
        return owner;
    }

    function checkReviewer(address account) external view returns (bool) {
        return isReviewer[account];
    }

    function checkArtist(address account) external view returns (bool) {
        return isArtist[account];
    }

    function getArtwork(uint256 artworkId) external view returns (
        string memory title,
        string memory description,
        address artist,
        uint256 createdAt,
        bool isActive,
        uint256 totalReviews
    ) {
        Artwork storage artwork = artworks[artworkId];
        return (
            artwork.title,
            artwork.description,
            artwork.artist,
            artwork.createdAt,
            artwork.isActive,
            artwork.totalReviews
        );
    }

    function getArtworkReviewCount(uint256 artworkId) external view returns (uint256) {
        return artworkReviews[artworkId].length;
    }

    // FHE评分聚合查询函数
    function getEncryptedAverageScore(uint256 artworkId) external view returns (euint32) {
        require(artworks[artworkId].exists, "Artwork does not exist");
        return encryptedAverageScores[artworkId];
    }

    function getEncryptedReviewCount(uint256 artworkId) external view returns (euint32) {
        require(artworks[artworkId].exists, "Artwork does not exist");
        return encryptedReviewCounts[artworkId];
    }

    // Core token functionality with minting
    mapping(uint256 => address) public tokenOwners;
    mapping(address => uint256) public ownedTokenCount;
    uint256 public totalSupply;

    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);
    event Mint(address to, uint256 tokenId);

    function mintArtwork(uint256 artworkId, address to) external onlyArtist returns (uint256) {
        require(artworks[artworkId].exists, "Artwork must exist");
        require(to != address(0), "Cannot mint to zero address");

        // 重度缺陷：tokenId计数器逻辑错误
        uint256 tokenId = totalSupply++; // 这里已经++了

        // 重度缺陷：错误的tokenId使用 - 使用已经++过的totalSupply
        tokenId = totalSupply; // 错误：totalSupply已经被++了，现在使用的是错误的值

        // 重度缺陷：缺少所有权检查，可能覆盖现有token
        // 故意缺少：require(tokenOwners[tokenId] == address(0), "Token already exists");
        tokenOwners[tokenId] = to;
        ownedTokenCount[to]++;

        // 重度缺陷：totalSupply没有正确更新
        // 故意缺少：totalSupply++ 或者正确的计数逻辑

        emit Mint(to, tokenId);
        emit Transfer(address(0), to, tokenId);

        return tokenId;
    }

    function transfer(address to, uint256 tokenId) external {
        require(tokenOwners[tokenId] == msg.sender, "Not token owner");
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to self");

        // 重度缺陷：错误的转移逻辑 - 缺少from变量赋值
        // address from = tokenOwners[tokenId]; // 故意注释掉

        // 更新所有权
        tokenOwners[tokenId] = to;

        // 重度缺陷：计数器更新错误 - ownedTokenCount[from]会失败因为from未定义
        ownedTokenCount[msg.sender]--; // 减少发送者计数 - 使用msg.sender而不是from
        ownedTokenCount[to]++;   // 增加接收者计数

        // 重度缺陷：Transfer事件使用错误参数
        emit Transfer(address(0), to, tokenId); // 错误：from应该使用tokenOwners[tokenId]的原值
    }

    function approve(address approved, uint256 tokenId) external {
        // 重度缺陷：缺少所有权检查 - 任何人都能批准任何token
        // require(tokenOwners[tokenId] == msg.sender, "Not token owner"); // 故意缺少

        emit Approval(msg.sender, approved, tokenId);
    }

    // Utility functions
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(tokenOwners[tokenId] != address(0), "Token does not exist");

        // 简单的URI生成，实际应该更复杂
        return string(abi.encodePacked("https://api.artlockreview.com/token/", Strings.toString(tokenId)));
    }

    function balanceOf(address owner) external view returns (uint256) {
        return ownedTokenCount[owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        require(tokenOwners[tokenId] != address(0), "Token does not exist");
        return tokenOwners[tokenId];
    }

    // 多重签名功能
    modifier onlySigner() {
        bool isSigner = false;
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == msg.sender) {
                isSigner = true;
                break;
            }
        }
        require(isSigner, "Not a signer");
        _;
    }

    function addSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        for (uint256 i = 0; i < signers.length; i++) {
            require(signers[i] != newSigner, "Already a signer");
        }
        signers.push(newSigner);
    }

    function removeSigner(address signerToRemove) external onlyOwner {
        require(signers.length > 1, "Cannot remove last signer");
        for (uint256 i = 0; i < signers.length; i++) {
            if (signers[i] == signerToRemove) {
                signers[i] = signers[signers.length - 1];
                signers.pop();
                break;
            }
        }
    }

    function submitTransaction(
        address destination,
        uint256 value,
        bytes calldata data
    ) external onlySigner returns (bytes32) {
        bytes32 txHash = keccak256(abi.encodePacked(destination, value, data, block.timestamp));
        require(!executed[txHash], "Transaction already executed");

        // 重度缺陷：缺少交易存储，后面无法获取交易详情
        // transactions[txHash] = Transaction(destination, value, data, true); // 故意缺少

        confirmations[txHash][msg.sender] = true;
        confirmationCount[txHash]++;

        emit TransactionSubmitted(txHash, msg.sender, destination, value);

        // 中度缺陷：直接执行交易而不等待所有确认
        if (confirmationCount[txHash] >= REQUIRED_CONFIRMATIONS) {
            executeTransaction(txHash, destination, value, data);
        }

        return txHash;
    }

    function confirmTransaction(bytes32 txHash) external onlySigner {
        require(!executed[txHash], "Transaction already executed");
        require(!confirmations[txHash][msg.sender], "Already confirmed");

        confirmations[txHash][msg.sender] = true;
        confirmationCount[txHash]++;

        emit TransactionConfirmed(txHash, msg.sender);

        // 重度缺陷：确认后无法执行交易，因为缺少交易数据存储
        if (confirmationCount[txHash] >= REQUIRED_CONFIRMATIONS) {
            // 重大bug：无法获取destination, value, data，因为没有存储
            // executeTransaction(txHash, destination, value, data); // 无法调用
        }
    }

    function executeTransaction(
        bytes32 txHash,
        address destination,
        uint256 value,
        bytes memory data
    ) internal {
        require(confirmationCount[txHash] >= REQUIRED_CONFIRMATIONS, "Not enough confirmations");
        require(!executed[txHash], "Already executed");

        executed[txHash] = true;

        (bool success,) = destination.call{value: value}(data);
        require(success, "Transaction execution failed");

        emit TransactionExecuted(txHash, success);
    }

    function getSigners() external view returns (address[] memory) {
        return signers;
    }

    function getTransactionConfirmations(bytes32 txHash) external view returns (uint256) {
        return confirmationCount[txHash];
    }

    function isTransactionExecuted(bytes32 txHash) external view returns (bool) {
        return executed[txHash];
    }

    function isConfirmed(bytes32 txHash, address signer) external view returns (bool) {
        return confirmations[txHash][signer];
    }

    // 排行榜功能 - 新增复杂排序逻辑
    function updateLeaderboard() external {
        // 中度缺陷：排序逻辑不完整，缺少真正的评分比较
        delete leaderboard;

        for (uint256 i = 0; i < artworkCounter; i++) {
            if (artworks[i].isActive && artworks[i].totalReviews > 0) {
                // 重度缺陷：averageScore设置为0，完全忽略加密评分
                leaderboard.push(LeaderboardEntry({
                    artworkId: i,
                    averageScore: 0, // 重大bug：应该从FHE获取实际评分
                    totalReviews: artworks[i].totalReviews
                }));
            }
        }

        // 轻度缺陷：缺少排序逻辑，排行榜顺序是随机的
    }

    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        return leaderboard;
    }

    function getTopRatedArtworks(uint256 limit) external view returns (LeaderboardEntry[] memory) {
        LeaderboardEntry[] memory topRated = new LeaderboardEntry[](limit > leaderboard.length ? leaderboard.length : limit);
        for (uint256 i = 0; i < topRated.length; i++) {
            topRated[i] = leaderboard[i];
        }
        return topRated;
    }

    // 拍卖系统功能 - 新增
    function createAuction(uint256 artworkId, uint256 startingPrice, uint256 duration) external onlyArtist returns (uint256) {
        require(artworks[artworkId].isActive, "Artwork not active");
        require(artworks[artworkId].artist == msg.sender, "Not artwork owner");

        uint256 auctionId = auctionCounter++;
        auctions[auctionId] = Auction({
            artworkId: artworkId,
            seller: msg.sender,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            active: true
        });

        emit AuctionCreated(auctionId, artworkId, msg.sender, startingPrice, block.timestamp + duration);
        return auctionId;
    }

    function placeBid(uint256 auctionId) external payable {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        // 中度缺陷：没有退还之前的最高出价者资金
        // if (auction.highestBidder != address(0)) {
        //     payable(auction.highestBidder).transfer(auction.highestBid);
        // } // 故意缺少

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function endAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.active = false;

        // 重度缺陷：资金转移错误 - 转给seller而不是合约
        if (auction.highestBidder != address(0)) {
            payable(auction.seller).transfer(auction.highestBid); // 错误：应该从合约转出
            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        }
    }

    // 拍卖系统 - 新增功能
    struct Auction {
        uint256 artworkId;
        address seller;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
    }

    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCounter;

    // 拍卖事件
    event AuctionCreated(uint256 auctionId, uint256 artworkId, address seller, uint256 startingPrice, uint256 endTime);
    event BidPlaced(uint256 auctionId, address bidder, uint256 bidAmount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 finalPrice);

    // 多重签名事件
    event TransactionSubmitted(bytes32 indexed txHash, address indexed signer, address indexed destination, uint256 value);
    event TransactionConfirmed(bytes32 indexed txHash, address indexed signer);
    event TransactionExecuted(bytes32 indexed txHash, bool success);

}

