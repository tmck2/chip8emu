import React from 'react';

export class ControlPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {selectedUrl: '', speed: 15}
    }

    render() {
        return (
            <div id="config-panel">
                <select id="program-select" value={this.state.selectedUrl} onChange={e => this.setState({selectedUrl: e.target.value})}>
                    <option key="default">Select a program</option>
                    {this.props.programs.map(g =>
                        <option key={g.name} value={g.url}>{g.name}</option>
                    )}
                </select>

                <button id="load-button" onClick={_ => this.props.loadProgram(this.state.selectedUrl)}>Load</button>
                <button onClick={this.props.onGo}>Go</button>
                <button onClick={this.props.onBreak}>Break</button>

                <div>
                    <div>
                        <label htmlFor="speed">Cycles/Frame:</label>
                    </div>
                    <select id="speed" value={this.state.speed} onChange={e => {
                        const speed = e.target.value;
                        this.setState({speed});
                        this.props.speedChanged(speed);
                    }}>
                        <option value={1}>1 cycle/frame</option>
                        <option value={3}>3 cycle/frame</option>
                        <option value={7}>7 cycle/frame</option>
                        <option value={15}>15 cycle/frame</option>
                        <option value={50}>50 cycle/frame</option>
                        <option value={100}>100 cycle/frame</option>
                        <option value={500}>500 cycle/frame</option>
                        <option value={1000}>1000 cycle/frame</option>
                    </select>
                </div>
            </div>);
    }
}

