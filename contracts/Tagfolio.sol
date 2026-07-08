// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Tagfolio {
    uint256 public nextTagId = 1;

    struct TagEntry {
        address owner;
        string displayName;
        string role;
        string interest;
        string city;
        string accent;
        uint256 createdAt;
    }

    mapping(uint256 => TagEntry) private tags;

    event TagCreated(
        uint256 indexed tagId,
        address indexed owner,
        string displayName,
        string role,
        string interest,
        string city
    );

    function createTag(
        string calldata displayName,
        string calldata role,
        string calldata interest,
        string calldata city,
        string calldata accent
    ) external returns (uint256 tagId) {
        require(bytes(displayName).length > 0 && bytes(displayName).length <= 32, "Invalid name");
        require(bytes(role).length > 0 && bytes(role).length <= 32, "Invalid role");
        require(bytes(interest).length > 0 && bytes(interest).length <= 48, "Invalid interest");
        require(bytes(city).length > 0 && bytes(city).length <= 32, "Invalid city");
        require(bytes(accent).length > 0 && bytes(accent).length <= 16, "Invalid accent");

        tagId = nextTagId++;
        tags[tagId] = TagEntry({
            owner: msg.sender,
            displayName: displayName,
            role: role,
            interest: interest,
            city: city,
            accent: accent,
            createdAt: block.timestamp
        });

        emit TagCreated(tagId, msg.sender, displayName, role, interest, city);
    }

    function getTag(
        uint256 tagId
    )
        external
        view
        returns (
            address owner,
            string memory displayName,
            string memory role,
            string memory interest,
            string memory city,
            string memory accent,
            uint256 createdAt
        )
    {
        TagEntry storage entry = tags[tagId];
        return (
            entry.owner,
            entry.displayName,
            entry.role,
            entry.interest,
            entry.city,
            entry.accent,
            entry.createdAt
        );
    }
}
