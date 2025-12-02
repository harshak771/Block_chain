// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecipeCollaboration
 * @dev Handles recipe collaboration invites and modifications
 */
contract RecipeCollaboration is Ownable {
    
    // Collaboration states
    enum CollaborationStatus { PENDING, ACTIVE, REJECTED, COMPLETED }
    enum ModificationStatus { PROPOSED, APPROVED, REJECTED, IMPLEMENTED }
    
    struct CollaborationInvite {
        uint256 recipeId;
        address inviter;
        address invitee;
        uint256 sharePercentage;
        uint256 createdAt;
        uint256 expiresAt;
        CollaborationStatus status;
    }
    
    struct ModificationProposal {
        uint256 recipeId;
        address proposer;
        string description;
        string newIPFSHash;
        uint256 createdAt;
        uint256 expiresAt;
        ModificationStatus status;
        uint256 approvalsNeeded;
        mapping(address => bool) approvals;
        address[] approvers;
    }
    
    struct CollaborationMetrics {
        uint256 totalCollaborations;
        uint256 activeCollaborations;
        uint256 totalModifications;
        uint256 approvedModifications;
    }
    
    // Mappings
    mapping(uint256 => CollaborationInvite[]) public collaborationInvites;
    mapping(uint256 => ModificationProposal[]) public modificationProposals;
    mapping(uint256 => CollaborationMetrics) public collaborationMetrics;
    mapping(address => uint256[]) public userCollaborations;
    
    constructor() Ownable(msg.sender) {}
    
    event CollaborationInviteSent(
        uint256 indexed recipeId,
        address indexed inviter,
        address indexed invitee,
        uint256 sharePercentage
    );
    
    event CollaborationInviteAccepted(
        uint256 indexed recipeId,
        address indexed acceptedBy
    );
    
    event CollaborationInviteRejected(
        uint256 indexed recipeId,
        address indexed rejectedBy
    );
    
    event ModificationProposed(
        uint256 indexed recipeId,
        uint256 indexed proposalIndex,
        address indexed proposer,
        string description
    );
    
    event ModificationApproved(
        uint256 indexed recipeId,
        uint256 indexed proposalIndex,
        address indexed approver
    );
    
    event ModificationRejected(
        uint256 indexed recipeId,
        uint256 indexed proposalIndex,
        address indexed rejector
    );
    
    event ModificationImplemented(
        uint256 indexed recipeId,
        uint256 indexed proposalIndex,
        string newIPFSHash
    );
    
    /**
     * @dev Send a collaboration invite
     */
    function sendCollaborationInvite(
        uint256 recipeId,
        address invitee,
        uint256 sharePercentage,
        uint256 expirationDays
    ) public {
        require(invitee != address(0), "Invalid invitee address");
        require(sharePercentage > 0 && sharePercentage <= 100, "Invalid share percentage");
        require(expirationDays > 0, "Expiration days must be positive");
        
        uint256 expiresAt = block.timestamp + (expirationDays * 1 days);
        
        CollaborationInvite memory invite = CollaborationInvite({
            recipeId: recipeId,
            inviter: msg.sender,
            invitee: invitee,
            sharePercentage: sharePercentage,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            status: CollaborationStatus.PENDING
        });
        
        collaborationInvites[recipeId].push(invite);
        
        emit CollaborationInviteSent(recipeId, msg.sender, invitee, sharePercentage);
    }
    
    /**
     * @dev Accept a collaboration invite
     */
    function acceptCollaborationInvite(uint256 recipeId, uint256 inviteIndex) public {
        require(inviteIndex < collaborationInvites[recipeId].length, "Invalid invite index");
        
        CollaborationInvite storage invite = collaborationInvites[recipeId][inviteIndex];
        
        require(invite.invitee == msg.sender, "Only invitee can accept");
        require(invite.status == CollaborationStatus.PENDING, "Invite is not pending");
        require(block.timestamp <= invite.expiresAt, "Invite has expired");
        
        invite.status = CollaborationStatus.ACTIVE;
        
        userCollaborations[msg.sender].push(recipeId);
        
        collaborationMetrics[recipeId].totalCollaborations++;
        collaborationMetrics[recipeId].activeCollaborations++;
        
        emit CollaborationInviteAccepted(recipeId, msg.sender);
    }
    
    /**
     * @dev Reject a collaboration invite
     */
    function rejectCollaborationInvite(uint256 recipeId, uint256 inviteIndex) public {
        require(inviteIndex < collaborationInvites[recipeId].length, "Invalid invite index");
        
        CollaborationInvite storage invite = collaborationInvites[recipeId][inviteIndex];
        
        require(invite.invitee == msg.sender, "Only invitee can reject");
        require(invite.status == CollaborationStatus.PENDING, "Invite is not pending");
        
        invite.status = CollaborationStatus.REJECTED;
        
        emit CollaborationInviteRejected(recipeId, msg.sender);
    }
    
    /**
     * @dev Propose a recipe modification
     */
    function proposeModification(
        uint256 recipeId,
        string memory description,
        string memory newIPFSHash,
        uint256 approvalsNeeded
    ) public {
        require(approvalsNeeded > 0, "Approvals needed must be positive");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        ModificationProposal storage proposal = modificationProposals[recipeId].push();
        
        proposal.recipeId = recipeId;
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.newIPFSHash = newIPFSHash;
        proposal.createdAt = block.timestamp;
        proposal.expiresAt = block.timestamp + 7 days;
        proposal.status = ModificationStatus.PROPOSED;
        proposal.approvalsNeeded = approvalsNeeded;
        
        uint256 proposalIndex = modificationProposals[recipeId].length - 1;
        
        emit ModificationProposed(recipeId, proposalIndex, msg.sender, description);
    }
    
    /**
     * @dev Approve a modification proposal
     */
    function approveModification(uint256 recipeId, uint256 proposalIndex) public {
        require(proposalIndex < modificationProposals[recipeId].length, "Invalid proposal index");
        
        ModificationProposal storage proposal = modificationProposals[recipeId][proposalIndex];
        
        require(proposal.status == ModificationStatus.PROPOSED, "Proposal is not pending");
        require(block.timestamp <= proposal.expiresAt, "Proposal has expired");
        require(!proposal.approvals[msg.sender], "Already approved");
        
        proposal.approvals[msg.sender] = true;
        proposal.approvers.push(msg.sender);
        
        emit ModificationApproved(recipeId, proposalIndex, msg.sender);
        
        // Check if proposal is approved
        if (proposal.approvers.length >= proposal.approvalsNeeded) {
            proposal.status = ModificationStatus.APPROVED;
            collaborationMetrics[recipeId].approvedModifications++;
            emit ModificationImplemented(recipeId, proposalIndex, proposal.newIPFSHash);
        }
    }
    
    /**
     * @dev Reject a modification proposal
     */
    function rejectModification(uint256 recipeId, uint256 proposalIndex) public {
        require(proposalIndex < modificationProposals[recipeId].length, "Invalid proposal index");
        
        ModificationProposal storage proposal = modificationProposals[recipeId][proposalIndex];
        
        require(proposal.status == ModificationStatus.PROPOSED, "Proposal is not pending");
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Unauthorized");
        
        proposal.status = ModificationStatus.REJECTED;
        
        emit ModificationRejected(recipeId, proposalIndex, msg.sender);
    }
    
    /**
     * @dev Get pending collaboration invites for a recipe
     */
    function getPendingInvites(uint256 recipeId) 
        public 
        view 
        returns (CollaborationInvite[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 0; i < collaborationInvites[recipeId].length; i++) {
            if (collaborationInvites[recipeId][i].status == CollaborationStatus.PENDING) {
                count++;
            }
        }
        
        CollaborationInvite[] memory pendingInvites = new CollaborationInvite[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < collaborationInvites[recipeId].length; i++) {
            if (collaborationInvites[recipeId][i].status == CollaborationStatus.PENDING) {
                pendingInvites[index] = collaborationInvites[recipeId][i];
                index++;
            }
        }
        
        return pendingInvites;
    }
    
    /**
     * @dev Get user collaborations
     */
    function getUserCollaborations(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userCollaborations[user];
    }
    
    /**
     * @dev Get modification proposals for a recipe
     */
    function getModificationProposals(uint256 recipeId) 
        public 
        view 
        returns (uint256[] memory statuses, uint256[] memory approvalCounts) 
    {
        uint256 length = modificationProposals[recipeId].length;
        statuses = new uint256[](length);
        approvalCounts = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            statuses[i] = uint256(modificationProposals[recipeId][i].status);
            approvalCounts[i] = modificationProposals[recipeId][i].approvers.length;
        }
        
        return (statuses, approvalCounts);
    }
    
    /**
     * @dev Get collaboration metrics
     */
    function getMetrics(uint256 recipeId) 
        public 
        view 
        returns (CollaborationMetrics memory) 
    {
        return collaborationMetrics[recipeId];
    }
}
