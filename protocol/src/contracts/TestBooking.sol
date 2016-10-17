//pragma solidity ^0.4.2;

/** @title overly simplified hotel booking contract
1. Hotel buys ether (on exchange or rather) from an intermediary of his trust, which also explains the web application.
2. Hotel offers room offer for period X on the Universal Booking Network and pays with ether.
3. Various agents try to sell the hotel room.
3a. No one books in week X and the hotel can withdraw its fees. EXIT
3b. Traveler reserves room through mediator.
    Mediator pays small reservation escrow so that only serious bookings are taken.
4. Traveler should settle booking
4a. He doesn't within grace period, room is bookable again.
  Reservation escrow is given to the hotel. RETURN TO 3
4b. Traveler settles payment
5. Now the mediator receives the fees, and the hotel the payment.
*/

contract OverlySimplifiedBooking{


    enum State {Open, Expired, Booked, Settled}

    struct Offer{
        uint startTime;
        uint endTime;
        uint price;
        uint mediatorFee;
        string description;
        bytes32 offerId;
        address offerer;
        address lead;
        address mediator;
        State status;
    }

    mapping (bytes32 => Offer) offers;
    bytes32[] offerList;

    mapping (address => uint) public balances;

    function OverlySimplifiedBooking(){

    }

    /**
     * @notice As a hotel I want to create an offer for the room `_id`: `_description` with the price `_price` and in the timeframe between `_start` and `_end`
     * @dev    2. Hotel offers room offer for period X on the Universal Booking Network and pays with ether.
     * @param _start the exact time when the room is available
     * @param _end the exact time when a checkout must be completed
     * @param _price the price of the offer, wich a traveler/ lead has to pay on settlement
     * @param _mediatorFee is the money a successful mediator will get for settling the offer
     * @param _description the description of the room offer, might be a hash of a extensive description
     * @param _id a unique ID of the offer.
     */
    function createOffer(uint _start, uint _end, uint _price, uint _mediatorFee, string _description, bytes32 _id) payable {
        // assert that id is unique
        // assert hotel pays if (_price + _fee != msg.value)
        // assert hotel is legitimate, authenticated and authorized
        // assert offer time is valid and not expired
        var d = _description; //might become hash later
        var offerer = msg.sender; // the hotel makes the offer for themselfs
        var o = Offer({startTime: _start,
                        endTime: _end,
                        price: _price,
                        mediatorFee: _mediatorFee,
                        description: d,
                        offerId: _id,
                        offerer: offerer,
                        lead: 0,
                        mediator: 0,
                        status: State.Open

        });

        offers[_id] = o; // becoms an open offer
        offerList.push(_id);
        OfferCreated(_description, offerer); //shout it out loud

    }
    event OfferCreated(string _description, address offerer);

    function getOffersCount() constant returns (uint){
        return offerList.length;
    }

    function getOffer(uint index) constant returns (
        uint startTime,
        uint endTime,
        uint price,
        uint mediatorFee,
        string description,
        bytes32 offerId,
        address offerer,
        address lead,
        address mediator,
        State status){

            var o = offers[offerList[index]];
            startTime = o.startTime;
            endTime = o.endTime;
            price = o.price;
            mediatorFee = o.mediatorFee;
            description = o.description;
            offerId= o.offerId;
            offerer= o.offerer;
            lead= o.lead;
            mediator = o.mediator;
            status = o.status;

        }

    /**
     * @notice As a mediator I want to book the offer `_id` for my lead `_lead`
     * @dev 2. Hotel offers room offer for period X on the Universal Booking Network and pays with ether.
     */
    function bookOffer(bytes32 _id, address _lead) unexpired(_id) payable{
        //if (msg.value != bookingFee) throw;
        //if offer is open
        var o = offers[_id];
        o.mediator = msg.sender;
        o.lead = _lead;
        o.status = State.Booked;
        OfferBooked (o.description, o.mediator);
    }
    event OfferBooked(string description, address mediator);

    /**
     * @notice As a lead I want to settle the pending booking for `_id` so that I get the room and my mediator gets its cut.
     */
    function settleBooking(bytes32 _id) unexpired(_id) payable{
        var o = offers[_id];
        //if (msg.value != o.price) throw;
        balances[o.offerer] += o.price ;
        balances[o.mediator] += o.mediatorFee; //do never ever use =+ its a trap
        o.status = State.Settled;

        BookingSettled(o.description, o.mediator, o.mediatorFee / 1 ether, o.offerer, o.price/ 1 ether);
    }
    event BookingSettled(string description, address mediator, uint mediatorfee, address offerer, uint hotelfee);

    function getBalance() constant returns (uint amount) {
        amount = balances[msg.sender];
    }

    /**
     * @notice As a mediator or hotellier I want to withdraw the money I've got.
     */
    function withdraw() payable {
        var cash = balances[msg.sender];
        balances[msg.sender]=0;
        var wasSuccessful = msg.sender.send(cash);
        BalanceWithdrawed(cash / 1 ether, msg.sender, wasSuccessful);
    }
    event BalanceWithdrawed(uint balance, address account , bool success);

    /**
     * @dev 3a. No one books in week X and the hotel can withdraw its fees. EXIT
     */
    modifier unexpired (bytes32 _id) {
        var o= offers[_id];
        if (o.status == State.Expired) throw; // if we are already in state expired no reason to continue;
        bool lodgingStarted = block.timestamp > o.startTime; //offer expires when the lodging time starts;
        if (lodgingStarted && o.status != State.Settled){  //simply put:  and the reservation is not settled
            o.status = State.Expired;
            balances[o.offerer] += o.mediatorFee; //hotel can withdraw its fees
        }
        _
    }

    modifier payable(){ //workaround until solidity 0.4 can be used
        _
    }

}

contract TestBooking is OverlySimplifiedBooking{


    function test() payable {
        createOffer();
        bookOffer();
        settleBooking();
        var actualAmount = getBalance()/ 1 ether;
        withdraw();
        if (actualAmount != 80){
            AssertionFailed("expected 80, was", actualAmount);

        }
    }

    function step1() payable{
        createOffer( now + 2 weeks, now + 3 weeks, 80 ether, 10 ether, "Villa Gisela ****S, 2 Persons, Wellness", 2);
    }

    function step2() payable{
         bookOffer(2, this);
    }

    function step3() payable{
         settleBooking(2);
    }
    event AssertionFailed(string msg, uint val);

    function createOffer() payable{
        createOffer( now + 1 weeks, now + 2 weeks, 70 ether, 10 ether, "Garni Rosi ***, 2 Persons, Breakfast included", 1);
    }

    function bookOffer() payable{
        bookOffer(1, this);
    }

    function settleBooking() payable{
        settleBooking(1);
    }


}
