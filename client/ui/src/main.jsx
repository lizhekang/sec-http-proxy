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
        var Button;
        var Label;
        if(!this.state.serverStatus) {
            Label = <RB.Label>Not running.</RB.Label>
            Button = <RB.Button bsStyle='primary' onClick={this.handleClick.bind(this, 'start_server')} >Start</RB.Button>
        }else {
            Label = <RB.Label>Address 127.0.0.1:{this.state.proxyPort}</RB.Label>
            Button = <RB.Button bsStyle='danger' onClick={this.handleClick.bind(this, 'stop_server')}>Stop</RB.Button>
        }
        return (
            <RB.Panel>
                <h3>Proxy Status</h3>
                <p>{Label}</p>
                {Button}
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