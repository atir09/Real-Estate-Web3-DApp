//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => bool) public inspectionStatus;
    mapping(uint256 => mapping(address => bool)) public approval;
    mapping(uint256 => bool) public earnestDeposited;

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method.");
        _;
    }

    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "Only Inspector Can call this method."
        );
        _;
    }

    modifier onlyauthorized() {
        require(
            (msg.sender == seller || msg.sender == lender),
            "Can Only be called by seller or lender"
        );
        _;
    }

    modifier onlyBuyer(uint256 _nftId) {
        require(msg.sender == buyer[_nftId], "Only Buyer can call this.");
        _;
    }

    function list(
        uint256 _nftId,
        address _seller,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public onlySeller {
        IERC721(nftAddress).transferFrom(_seller, address(this), _nftId);
        isListed[_nftId] = true;
        buyer[_nftId] = _buyer;
        purchasePrice[_nftId] = _purchasePrice;
        escrowAmount[_nftId] = _escrowAmount;
    }

    function depositEarnest(uint256 _nftId) public payable {
        require(
            msg.value >= escrowAmount[_nftId],
            "Amount Lower than the Required Escrow Amount"
        );

        buyer[_nftId] = msg.sender;
        earnestDeposited[_nftId] = true;
    }

    function updateInspectionStatus(
        uint256 _nftId,
        bool _status
    ) public onlyInspector {
        require(earnestDeposited[_nftId], "Earnest not yet deposited by Buyer");
        inspectionStatus[_nftId] = _status;
    }

    function approveSale(uint256 _nftId) public onlyauthorized {
        require(inspectionStatus[_nftId], "Inspection Not passed yet");
        if (msg.sender == seller) {
            require(
                approval[_nftId][lender],
                "Not yet approved and lended by lender"
            );
        }
        approval[_nftId][msg.sender] = true;
    }

    //Require Inspection Passed;
    // Require  Approval of seller and lender;
    // Require Total Amount to be greater than equal to Purchase amount
    // Require
    function finalizeSale(uint256 _nftId) public onlySeller {
        require(
            inspectionStatus[_nftId],
            "Inspection is not yet passed by the inspectore"
        );
        require(
            approval[_nftId][seller] && approval[_nftId][lender],
            "Not yet approved by seller and lender"
        );

        require(
            address(this).balance >= purchasePrice[_nftId],
            "Cannot proceed to sell, Falling short of funds."
        );

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        isListed[_nftId] = false;

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftId], _nftId);
    }

    receive() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
