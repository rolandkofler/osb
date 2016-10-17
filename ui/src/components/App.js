import React, { Component, PropTypes } from 'react';

import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import LinearProgress from 'material-ui/LinearProgress';
import Timestamp from 'react-timestamp';

import '../../vendor/bootstrap/css/bootstrap.min.css';
import '../../vendor/bootstrap/css/bootstrap-theme.min.css';

export default class App extends Component {
  static get propTypes() {
    return {
      loading: PropTypes.bool.isRequired,

      account: PropTypes.string,
      cash: PropTypes.number,
      securities: PropTypes.object,
      agreements: PropTypes.array,
      orders: PropTypes.array,
      trades: PropTypes.array,
      loans: PropTypes.array,

      createOffer: PropTypes.func,
      runDemo: PropTypes.func,
      runDemo2: PropTypes.func,
      runDemo3: PropTypes.func,
      runDemo4: PropTypes.func
    };
  }

  render() {
    return (
      <div>
        <h1>Blockchain Booking Market</h1>
        <FlatButton
          label="[1] Create Offer"
          onTouchTap={this.props.runDemo}
        />
        <FlatButton
          label="[2] Book Offer"
          onTouchTap={this.props.runDemo2}
        />

        <FlatButton
          label="[3] Settle Offer"
          onTouchTap={this.props.runDemo3}
        />
        <FlatButton
          label="[4] Withdraw Money"
          onTouchTap={this.props.runDemo4}
        />
        {this.renderBalancesCard()}
        {this.renderRoomOfferCard()}
        {/*{this.renderOrdersCard()}
        {this.renderTradesCard()}
        {this.renderLoansCard()} */}
      </div>
    );
  }

  renderBalancesCard() {
    const securities = this.props.securities
      ? Object.keys(this.props.securities).map(
          key => (
              <TableRow key={key}>
                <TableRowColumn>{key}</TableRowColumn>
                <TableRowColumn>{this.props.securities[key]}</TableRowColumn>
              </TableRow>
          )
        )
        : null;

    return (
      <Card>
        <CardTitle
          subtitle={"Ethereum Wallet: "+this.props.account}>
          {this.renderProgress()}
        </CardTitle>
      </Card>
    );
  }

  renderRoomOfferCard() {
    const stateNames = ['Open', 'Expired', 'Booked', 'Settled'];

    const makeActions = (agreement, index) => {
      if (stateNames[agreement.state.toNumber()] === 'PENDING') {
        if (agreement.to === this.props.account) {
          return (
            <AcceptButton
              onConfirm={x => this.props.acceptLendingAgreement(index)}
            />
          );
        }
      }

      return <div />;
    };

    const agreements = this.props.agreements
      ? this.props.agreements.map(
          (a, i) => (
              <TableRow key={i}>
                <TableRowColumn><Timestamp time={a.from} format="date"/></TableRowColumn>
                <TableRowColumn><Timestamp time={a.to} format="date"/></TableRowColumn>
                <TableRowColumn>{a.security}</TableRowColumn>
                <TableRowColumn>{a.haircut.toNumber() / Math.pow(10, 18)} ETH</TableRowColumn>
                <TableRowColumn>{a.rate.toNumber() / Math.pow(10, 18)} ETH</TableRowColumn>
                <TableRowColumn>{stateNames[a.state.toNumber()]}</TableRowColumn>
                <TableRowColumn>{makeActions(a, i)}</TableRowColumn>
              </TableRow>
          )
        )
        : null;

    return (
      <Card>
        <CardTitle title="Room Offers">
          {this.renderProgress()}
        </CardTitle>
        <CardText>
          <Table
            selectable={false}
            fixedHeader={false}
            style={{'tableLayout': 'auto'}}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>From</TableHeaderColumn>
                <TableHeaderColumn>To</TableHeaderColumn>
                <TableHeaderColumn>Description</TableHeaderColumn>
                <TableHeaderColumn>Broker Fee</TableHeaderColumn>
                <TableHeaderColumn>Price</TableHeaderColumn>
                <TableHeaderColumn>State</TableHeaderColumn>
                <TableHeaderColumn>Actions</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {agreements}
            </TableBody>
          </Table>
        </CardText>
        <CardActions>
          <CreateRoomOfferDialog
            createOffer={this.props.createOffer}
          />
        </CardActions>
      </Card>
    );
  }

  renderOrdersCard() {
    const stateNames = ['PENDING', 'MATCHED', 'CANCELLED'];
    const buySell = ['BUY', 'SELL'];

    const orders = this.props.orders
      ? this.props.orders.map(
          (a, i) => (
              <TableRow key={i}>
                //<TableRowColumn><Timestamp time="1450663457" format="ago"/></TableRowColumn>
                <TableRowColumn><Timestamp time={a.to}/></TableRowColumn>
                <TableRowColumn>{buySell[a.buysell.toNumber()]}</TableRowColumn>
                <TableRowColumn>{a.security}</TableRowColumn>
                <TableRowColumn>{a.units.toNumber()}</TableRowColumn>
                <TableRowColumn>£{a.price.toNumber() / 100.0}</TableRowColumn>
                <TableRowColumn>
                  {stateNames[a.state.toNumber()]}
                </TableRowColumn>
              </TableRow>
          )
        )
        : null;

    return (
      <Card>
        <CardTitle title="Orders">
          {this.renderProgress()}
        </CardTitle>
        <CardText>
          <Table
            selectable={false}
            fixedHeader={false}
            style={{'table-layout': 'auto'}}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>From</TableHeaderColumn>
                <TableHeaderColumn>To</TableHeaderColumn>
                <TableHeaderColumn>Type</TableHeaderColumn>
                <TableHeaderColumn>Security</TableHeaderColumn>
                <TableHeaderColumn>Units</TableHeaderColumn>
                <TableHeaderColumn>Price</TableHeaderColumn>
                <TableHeaderColumn>State</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {orders}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderTradesCard() {
    const stateNames = ['PENDING', 'EXECUTED', 'CANCELLED'];

    const trades = this.props.trades
      ? this.props.trades.map(
          (a, i) => (
              <TableRow key={i}>
                <TableRowColumn>{a.buyer}</TableRowColumn>
                <TableRowColumn>{a.seller}</TableRowColumn>
                <TableRowColumn>{a.security}</TableRowColumn>
                <TableRowColumn>{a.units.toNumber()}</TableRowColumn>
                <TableRowColumn>£{a.price.toNumber() / 100.0}</TableRowColumn>
                <TableRowColumn>
                  {stateNames[a.state.toNumber()]}
                </TableRowColumn>
              </TableRow>
          )
        )
        : null;

    return (
      <Card>
        <CardTitle title="Trades">
          {this.renderProgress()}
        </CardTitle>
        <CardText>
          <Table
            selectable={false}
            fixedHeader={false}
            style={{'table-layout': 'auto'}}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Buyer</TableHeaderColumn>
                <TableHeaderColumn>Seller</TableHeaderColumn>
                <TableHeaderColumn>Security</TableHeaderColumn>
                <TableHeaderColumn>Units</TableHeaderColumn>
                <TableHeaderColumn>Price</TableHeaderColumn>
                <TableHeaderColumn>State</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {trades}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderLoansCard() {
    const stateNames = ['ACTIVE', 'INACTIVE'];

    const loans = this.props.loans
      ? this.props.loans.map(
          (a, i) => (
              <TableRow key={i}>
                <TableRowColumn>{a.lender}</TableRowColumn>
                <TableRowColumn>{a.borrower}</TableRowColumn>
                <TableRowColumn>{a.security}</TableRowColumn>
                <TableRowColumn>{a.units.toNumber()}</TableRowColumn>
                <TableRowColumn>
                  <Timestamp time={a.ts_start}/>
                </TableRowColumn>
                <TableRowColumn>
                  <Timestamp time={a.ts_end}/>
                </TableRowColumn>
                <TableRowColumn>{a.margin.toNumber()/100.0}%</TableRowColumn>
                <TableRowColumn>£{a.interest_paid.toNumber()}</TableRowColumn>
                <TableRowColumn>
                  {stateNames[a.state.toNumber()]}
                </TableRowColumn>
              </TableRow>
          )
        )
        : null;

    return (
      <Card>
        <CardTitle title="Loans">
          {this.renderProgress()}
        </CardTitle>
        <CardText>
          <Table
            selectable={false}
            fixedHeader={false}
            style={{'table-layout': 'auto'}}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Lender</TableHeaderColumn>
                <TableHeaderColumn>Borrower</TableHeaderColumn>
                <TableHeaderColumn>Security</TableHeaderColumn>
                <TableHeaderColumn>Units</TableHeaderColumn>
                <TableHeaderColumn>Start time</TableHeaderColumn>
                <TableHeaderColumn>End time</TableHeaderColumn>
                <TableHeaderColumn>Margin</TableHeaderColumn>
                <TableHeaderColumn>Interest paid</TableHeaderColumn>
                <TableHeaderColumn>State</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {loans}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderProgress() {
    if (this.props.loading) {
      return <LinearProgress mode="indeterminate" />;
    }

    return <div />;
  }
}

class CreateRoomOfferDialog extends React.Component {
  static get propTypes() {
    return {
      createOffer: PropTypes.func,
    };
  }

  state = {
    from: "2016/10/23",
    to: "2016/10/30",
    price: '30',
    fee: '10',
    desc: 'Garni Rosi ***, Breakfast included'
  };

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleSubmit() {
    this.props.createOffer({
      from: this.state.from,

      rate: this.state.rate,
      haircut: this.state.haircut,
      recipient: this.state.recipient,
      security: this.state.security,
    }).then(
      x => this.handleClose(),
    );
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Create"
        primary={true}
        keyboardFocused={true}
        onTouchTap={x => this.handleSubmit(x)}
      />,
    ];

    const dialog = this.state.open ? (
        <Dialog
          title="New Room Offer"
          actions={actions}
          modal={true}
          open={true}
          onRequestClose={this.handleClose}
        >
        <TextField
          hintText="available from"
          floatingLabelText="From"
          value={this.state.from || ""}
          onChange={
            event => this.setState({
              recipient: event.target.value
            })
          }
        />
        <TextField
          hintText="available to"
          floatingLabelText="To"
          value={this.state.to || ""}
          onChange={
            event => this.setState({
              recipient: event.target.value
            })
          }
        />
          <TextField
            hintText="guest fee for the time interval"
            floatingLabelText="Price"
            value={this.state.price || ""}
            onChange={
              event => this.setState({
                recipient: event.target.value
              })
            }
          />
          <TextField
            hintText="what the broker recieves for finding a paying guest"
            floatingLabelText="Broker Fee"
            value={this.state.fee}
            onChange={
              event => this.setState({
                security: event.target.value
              })
            }
          />
          <TextField
            hintText="describe your offer extensively"
            multiLine="true"
            rows="2"
            floatingLabelText="Description"
            value={this.state.desc}
            onChange={
              event => this.setState({
                haircut: event.target.value
              })
            }
          />
        </Dialog>
    ) : null;

    return (
      <div>
        <RaisedButton
          label="Create Offer"
          primary={true}
          onTouchTap={this.handleOpen}
        />

        {dialog}
      </div>
    );
  }
}

class AcceptButton extends React.Component {
  static get propTypes() {
    return {
      onConfirm: PropTypes.func,
    };
  }

  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleConfirm() {
    this.props.onConfirm().then(x => this.handleClose());
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={x => this.handleClose(x)}
      />,
      <FlatButton
        label="Confirm"
        primary={true}
        keyboardFocused={true}
        onTouchTap={x => this.handleConfirm(x)}
      />,
    ];

    return (
      <div>
        <FlatButton label="Accept" onTouchTap={this.handleOpen} primary={true} />
        <Dialog
          title="Are you sure you want to accept this agreement?"
          actions={actions}
          modal={true}
          open={this.state.open}
          onRequestClose={this.handleClose}
        />
      </div>
    );
  }
}
