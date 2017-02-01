import React from 'react';
import { TextField, SelectField, MenuItem, RaisedButton, Slider } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { compose, withState, withContext, lifecycle, mapProps } from 'recompose';
import injectTapEventPlugin from 'react-tap-event-plugin';
import languages from './languages.json';
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const getApiUrl = () => `http://${location.hostname}:5005`;
const announce = (roomName, text, language, volume) => {
    fetch(`${getApiUrl()}/${roomName}/say/${text}/${language}/${volume}`)
        .then(res => res.json())
        .then((json) => alert(JSON.stringify(json)));
};

const announceAll = (text, language, volume) => (
    fetch(`${getApiUrl()}/sayall/${text}/${language}/${volume}`)
        .then(res => res.json())
        .then((json) => alert(JSON.stringify(json)))
);


const getRooms = () => fetch(getApiUrl() + '/zones')
    .then(res => res.json())
    .then(zones => zones.map(({coordinator: {roomName}}) => roomName));

const getRandomJoke = () => fetch('https://api.icndb.com/jokes/random')
    .then(res => res.json())
    .then(({value: {joke}}) => joke);

const getRandomMeme = () => fetch('http://belikebill.azurewebsites.net/billgen-API.php?default=1&name=Alexey', {mode: 'no-cors'})
    .then(res => res.blob())
    .then(blob => (window.URL || window.webkitURL).createObjectURL(blob));

class RandomQuote extends React.Component {
    constructor() {
        super();
        this.state = {
            joke: null
        }
    }
    render() {
        const {joke} = this.state;
        return <span>{joke ? joke : '...'}</span>;
    }

    componentWillMount() {
        getRandomJoke()
            .then(joke => this.setState({
                joke
            }))
    }
}

class RandomMeme extends React.Component {
    constructor() {
        super();
        this.state = {
            src: null
        }
    }
    render() {
        const {src} = this.state;
        return src ? <img style={{width: 450, height: 250}} src={"http://belikebill.azurewebsites.net/billgen-API.php?default=1&name=Alexey"} /> : <span>...</span>
    }

    componentWillMount() {
        getRandomMeme()
            .then(src => this.setState({
                src
            }))
    }
}

const AppComponent = ({
    text,
    setText,
    roomName,
    setRoomName,
    roomOptions = [],
    lang,
    setLang,
    volume,
    setVolume,
    go
}) => (
    <div style={{height: '100vh', width: '100vw', display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center', flexWrap:'wrap'}}>
        {/*<h1 style={{maxWidth: 400}}><RandomQuote/></h1>*/}
        <RandomMeme/>
        <TextField floatingLabelText="Text" value={text} onChange={(e, v) => setText(v)} />
        {/*<TextField value={roomName} onChange={setRoomName} floatingLabelText="Room Name" />*/}
        <SelectField value={roomName} hintText="All" floatingLabelText="Room" floatingLabelFixed onChange={(e, i, v) => setRoomName(v)}>
            <MenuItem primaryText="All"/>
            {
                roomOptions.map(
                    option => <MenuItem value={option} primaryText={option} key={option}/>
                )
            }
        </SelectField>
        <SelectField value={lang} onChange={(e, i, v) => setLang(v)} floatingLabelText="Language">
            {
                languages.map(
                    ({code, name}) => <MenuItem value={code} primaryText={`${name} - ${code}`} key={code} />
                )
            }
        </SelectField>
        <label>Volume</label>
        <Slider min={0} step={1} max={100} style={{width: 200}} value={volume} onChange={(e, v) => setVolume(v)} floatingLabelText="Volume"/>
        <RaisedButton primary label="Go" onClick={go} />
    </div>
);

const App = compose(
    withState('text', 'setText', ''),
    withState('roomName', 'setRoomName', ''),
    withState('lang', 'setLang', 'en-us'),
    withState('volume', 'setVolume', 0),
    withState('roomOptions', 'setRoomOptions'),
    withContext({
        muiTheme: React.PropTypes.any
    }, () => ({
        muiTheme: getMuiTheme()
    })),
    lifecycle({
        componentWillMount: function() {
            getRooms().then(this.props.setRoomOptions)
        }
    }),
    mapProps(
        props => ({
            ...props,
            go: () => {
                props.roomName ?
                    announce(props.roomName, props.text, props.lang, props.volume)
                    :
                    announceAll(props.text, props.lang, props.volume)
            }
        })
    )
)(AppComponent);

export default App;
