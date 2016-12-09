import React from 'react'
import ReactDom from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Paper from 'material-ui/Paper'
import LinearProgress from 'material-ui/LinearProgress'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import injectTapEventPlugin from 'react-tap-event-plugin'
import Snackbar from 'material-ui/Snackbar'
import {grey50} from 'material-ui/styles/colors'
import './style/main.sass'

const {ipcRenderer, clipboard} = require('electron')

injectTapEventPlugin()

class FileHolder extends React.Component {
  constructor(props) {
    super(props)
    this.handleDrop = this.handleDrop.bind(this)
    this.state = {
      progvisible: false,
      completed: 0,
      percentage: '',
      transferred: '',
      size: ''
    }
    ipcRenderer.on('hash-prog', (event, percentage, transferred, size) => {
      this.setState({
        progvisible: true,
        completed: percentage,
        percentage: percentage,
        transferred: transferred,
        size: size
      })
    })
    ipcRenderer.on('hash-ready', (event, hashes) => {
      this.setState({
        progvisible: false,
        completed: 0,
        percentage: '',
        transferred: '',
        size: ''
      })
    })
  }

  noHandle(event) {
    event.preventDefault()
  }

  handleDrop(event) {
    event.preventDefault()
    for (let file of event.dataTransfer.files) {
      this.fileSelected(file.path)
    }
  }

  fileSelected(filePath) {
    if (!filePath) {
      return
    }
    ipcRenderer.send('file-selected', filePath)
  }

  render() {
    const paperStyle = {
      height: 200,
      width: 500,
      margin: 15,
      textAlign: 'center',
      display: 'inline-block',
      backgroundColor: grey50,
    }
    let progStyle = {
      visibility: this.state.progvisible ? 'visible' : 'hidden'
    }
    let parag = null
    if (this.state.progvisible) {
      parag =
        <p id='stat-parag'>
          {this.state.percentage}%<br/><br/>
          calculated: {this.state.transferred}, size: {this.state.size}
        </p>
    } else {
      parag = <p id='drag-parag'>Drag your file here</p>
    }
    return (
      <div id='file-holder'>
        <Paper style={paperStyle} zDepth={2} onDragOver={this.noHandle}
            onDragLeave={this.noHandle} onDragEnd={this.noHandle}
            onDrop={this.state.progvisible ? this.noHandle : this.handleDrop}>
          <LinearProgress style={progStyle} mode="determinate"
            value={this.state.completed}/>
          {parag}
        </Paper>
      </div>
    )
  }
}

class HashHolder extends React.Component {
  constructor(props) {
    super(props)
    this.handleTouch = this.handleTouch.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.state = {open: false, hashes: ''}
    ipcRenderer.on('hash-ready', (event, hashes) => {
      this.setState({hashes: hashes})
    })
  }

  handleTouch(event, hash) {
    event.preventDefault()
    if (hash) {
      clipboard.writeText(hash)
      this.setState({open: true})
    }
  }

  handleClose() {
    this.setState({open: false})
  }

  render() {
    const listStyle = {
      fontFamily: 'monospace',
      fontSize: 13,
      fontWeight: 'bold',
      wordWrap: 'break-word',
    }
    let hashLabels = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']
    let hashListItems = []
    for (let i = 0; i < 5; i++) {
      hashListItems.push(<ListItem key={i} style={listStyle}
        primaryText={hashLabels[i] + ': '}
        secondaryText={this.state.hashes[i] || ''}
        onTouchTap={(e) => this.handleTouch(e, this.state.hashes[i])}/>)
      hashListItems.push(<Divider key={i + 5}/>)
    }
    const paperStyle = {
      minWidth: 500,
      margin: 15,
      backgroundColor: grey50,
    }
    return (
      <Paper style={paperStyle} zDepth={2}>
        <List>
          {hashListItems}
        </List>
        <Snackbar open={this.state.open} message="Hash just copied to clipboard"
          autoHideDuration={3000} onRequestClose={this.handleClose}/>
      </Paper>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider>
        <div id='app'>
          <FileHolder/>
          <HashHolder/>
        </div>
      </MuiThemeProvider>
    )
  }
}

ReactDom.render(<App/>, document.getElementById('react-root'))
