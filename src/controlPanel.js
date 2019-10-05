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
                <div className="slidercontainer">
                    <div>
                        <label htmlFor="speed">Cycles/Frame:</label>
                    </div>
                    <input type="range" className="slider" min="1" max="100" value={this.state.speed}
                           onChange={e => {
                               const speed = e.target.value;
                               this.setState({speed});
                               this.props.speedChanged(speed);
                           }} />
                </div>
            </div>);
    }
}

