// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./aha_base.sol";

contract AHAEth is AHABase{
    bytes32 public constant PREDICATE_ROLE = keccak256("PREDICATE_ROLE");

    constructor(address[] memory initialWhitelist, address mintableAssetProxy) AHABase(initialWhitelist) {
        _grantRole(PREDICATE_ROLE, mintableAssetProxy);
    }

    // In eth contract, only allow predicate contract to mint new tokens as told by the polygon doc
    // https://docs.polygon.technology/docs/develop/ethereum-polygon/mintable-assets/
    function mint(address to, uint256 amount) public onlyRole(PREDICATE_ROLE) {
        _mint(to, amount);
    }
}