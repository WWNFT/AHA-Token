// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./transferwhitelistable.sol";

abstract contract AHABase is ERC20, AccessControl, ERC20Snapshot, Pausable, TransferWhitelistable {
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELIST_EDITOR_ROLE = keccak256("WHITELIST_EDITOR_ROLE");

    constructor(address[] memory initialWhitelist, address initAdminWallet) ERC20("ArtistsHelpArtists", "AHA") TransferWhitelistable(initialWhitelist)  {
        _grantRole(DEFAULT_ADMIN_ROLE, initAdminWallet);
        _grantRole(SNAPSHOT_ROLE, initAdminWallet);
        _grantRole(PAUSER_ROLE, initAdminWallet);
        _grantRole(WHITELIST_EDITOR_ROLE, initAdminWallet);
    }

    function addTransferWhitelist(address dest) public onlyRole(WHITELIST_EDITOR_ROLE) {
        super._addTransferWhitelist(dest);
    }

    function addTransferWhitelistBatch(address[] calldata dest) public onlyRole(WHITELIST_EDITOR_ROLE) {
        super._addTransferWhitelistBatch(dest);
    }

    function removeTransferWhiteList(address dest) public onlyRole(WHITELIST_EDITOR_ROLE) {
        super._removeTransferWhiteList(dest);
    }

    function removeTransferWhitelistBatch(address[] calldata dest) public onlyRole(WHITELIST_EDITOR_ROLE) {
        super._removeTransferWhitelistBatch(dest);
    }

    function snapshot() public onlyRole(SNAPSHOT_ROLE) {
        _snapshot();
    }

    function getCurrentSnapshotId() public view returns (uint256){
        return _getCurrentSnapshotId();
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        virtual override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

     // Transfer from but only approve if to address is whitelisted
    function transfer(address to, uint256 amount) public onlyTransferWhitelisted(_msgSender(), to) virtual override returns (bool) {
        return super.transfer(to, amount);
    }

    // Transfer from but only approve if to address is whitelisted
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public onlyTransferWhitelisted(from, to) virtual override returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}