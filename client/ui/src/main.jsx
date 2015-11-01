var React = require('react'),
    ReactDOM = require('react-dom'),
    RB = require('react-bootstrap'),
    ipc = require('ipc');

var ContentBox = React.createClass({
    displayName: 'ContentBox',
    componentWillMount: function() {
        // Setting some timer
        this.setTimer();
    },
    getInitialState: function() {
        return {serverStatus: false}
    },
    render: function() {
        var StartButton;
        var ServerStatus = <RB.Lable>Waiting for connect to the server.</RB.Lable>;
        var Notification;
        if(!this.state.serverStatus) {
            Notification = <RB.Label>Not running.</RB.Label>;
            ServerStatus = <RB.Label>Waiting for connect to the server.</RB.Label>;
            StartButton = <RB.Button bsStyle='primary' onClick={this.handleClick.bind(this, 'start_server')} block>Start</RB.Button>;
        }else {
            Notification = <RB.Label>Address 127.0.0.1:{this.state.proxyPort}</RB.Label>;
            ServerStatus = <RB.Label>{this.state.tips}</RB.Label>;
            StartButton = <RB.Button bsStyle='danger' onClick={this.handleClick.bind(this, 'stop_server')} block>Stop</RB.Button>;
        }
        return (
            <RB.Panel>
                <h3>Proxy Status</h3>
                <p>{Notification}</p>
                <p>{ServerStatus}</p>
                {StartButton}
            </RB.Panel>
        );
    },
    setTimer: function() {
        // Query server status
        setInterval(function() {
            var msg = ipc.sendSync('query_server_status');
            this.setState(msg);
            console.log(msg);
        }.bind(this), 1000);
    },
    handleClick: function(msg) {
        ipc.send(msg);
    }
});

ReactDOM.render(
    <ContentBox />,
    document.getElementById('content')
);