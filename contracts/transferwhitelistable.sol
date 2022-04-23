import "@openzeppelin/contracts/utils/Context.sol";

abstract contract TransferWhitelistable is Context {
    mapping(address => bool) private _whitelisted_transfer_destination;

    constructor(address[] memory initialWhitelist) {
        for(uint256 i=0; i < initialWhitelist.length; i++){
            _whitelisted_transfer_destination[initialWhitelist[i]] = true;
        }
    }

    function _addTransferWhitelist(address dest) internal {
        _whitelisted_transfer_destination[dest] = true;
    }

    function _addTransferWhitelistBatch(address[] memory dest) internal {
        for(uint256 i=0; i < dest.length; i++){
            _whitelisted_transfer_destination[dest[i]] = true;
        }
    }

    function _removeTransferWhiteList(address dest) internal {
        _whitelisted_transfer_destination[dest] = false;
    }

    function _removeTransferWhitelistBatch(address[] memory dest) internal {
        for(uint256 i=0; i < dest.length; i++){
            _whitelisted_transfer_destination[dest[i]] = false;
        }
    }

    function isWhitelisted(address dest) public view returns (bool) {
        return _whitelisted_transfer_destination[dest];
    }

    modifier onlyTransferWhitelisted(address from, address to) {
        // as long as one party is whitelisted then approve
        require(whitelisted(from) || whitelisted(to), "TransferWhitelistable: not whitelisted for transfer");
        _;
    }

    function whitelisted(address checkingAddress) public view virtual returns (bool) {
        return _whitelisted_transfer_destination[checkingAddress];
    }

}