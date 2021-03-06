import React from 'react';

export class ControlPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="control-panel">
                <div>
                    <select id="program-select" 
                        value={this.props.selectedProgram}
                        onChange={e => e.target.value >= 0 && this.props.onProgramSelected(e.target.value)}>

                        <option key="default" value={-1}>Select a program</option>

                        {this.props.programs.map((g, ix) =>
                            <option key={g.name} value={ix}>{g.name}</option>
                        )}
                    </select>
                </div>

                <div>
                    <button onClick={this.props.onGo}>Go</button>
                    <button onClick={this.props.onBreak}>Break</button>
                    <button onClick={this.props.onStep}>Step</button>
                    <button onClick={this.props.onReset}>Reset</button>
                    <button onClick={this.props.toggleMonitor}>Monitor</button>
                </div>

                <div>
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
            </div>);
    }
}

