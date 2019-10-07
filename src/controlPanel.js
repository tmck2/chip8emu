import React from 'react';

export class ControlPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="config-panel">
                <select id="program-select" 
                    value={this.props.selectedProgram}
                    onChange={e => this.props.onProgramSelected(e.target.value)}>

                    {this.props.programs.map((g, ix) =>
                        <option key={g.name} value={ix}>{g.name}</option>
                    )}
                </select>

                <button id="load-button" onClick={this.props.onLoadProgram}>Load</button>
                <button onClick={this.props.onGo}>Go</button>
                <button onClick={this.props.onBreak}>Break</button>
                <button onClick={this.props.onStep}>Step</button>

                <div>
                    <div>
                        <label htmlFor="speed">Cycles/Frame:</label>
                    </div>
                    <select id="speed" value={this.props.speed} onChange={e => this.props.speedChanged(e.target.value)}>
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

                <div>
                    {this.props.programs[this.props.selectedProgram].instructions}
                </div>
            </div>);
    }
}

