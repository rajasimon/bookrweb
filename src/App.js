import React, { Component } from 'react';
import '../node_modules/bulma/css/bulma.css';

import Resumable from 'resumablejs';
import ReconnectingWebSocket from 'reconnecting-websocket';

class App extends Component {
  constructor() {
    super()

    this.state = {
      filename: '',
      progress: '',
      message: ''
    }
    this.fileInput = React.createRef();

    this.handleUpload = this.handleUpload.bind(this)
  }

  componentDidMount() {
    const socket = new ReconnectingWebSocket('ws://' + 'localhost:8000' + '/ws/chat/stream/')

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data).message
      
      if (data.isCompleted) {
        this.setState({message: data.result})
      }
    }
  }

  handleUpload(event) {
    // Prevent to submit normal form we need to process here.
    event.preventDefault()
  
    const r = Resumable({
      target: 'https://bookrapi.herokuapp.com/upload/'
    })

    // Using react ref to get the selected file
    r.addFile(this.fileInput.current.files[0])

    // Listening fileadded event
    r.on('fileAdded', function(file) {
      // Get the filename and update the file field
      this.setState({fileName: file.name})

      // Start uploading the file to server
      r.upload()
    }.bind(this))

    r.on('fileSuccess', function(file,message){
      console.log(message)
    });

    r.on('fileError', function(file, message) {
      console.log(message)
    })

    r.on('fileProgress', function(file) {
      this.setState({progress: r.progress()})
    }.bind(this))

    r.on('cancel', function() {
      console.log('cancelled')
    })
  }

  render() {
    return (
      <div className="App">
        <section className="section">
          <div className="container">
            <div className="columns is-mobile is-centered">
              <div className="column is-half-desktop">
                <h1 className="title">Bookrfaas Coding Challenge</h1>
                <p className="subtitle">
                  Perform smooth file upload to server without breaking the user flow. 
                </p>
                <form>
                  <div className="field">
                    <div className="file has-name is-fullwidth">
                      <label className="file-label">
                        <input className="file-input" id="fileUploadInput" type="file" name="resume" ref={this.fileInput}/>
                        <span className="file-cta">
                          <span className="file-icon">
                            <i className="fas fa-upload"></i>
                          </span>
                          <span className="file-label">
                            Choose a file…
                          </span>
                        </span>
                        <span className="file-name">
                          {this.state.filename}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control">
                    <button  className="button is-primary" onClick={this.handleUpload}>Upload</button>
                    </div>
                  </div>
                </form>
                <br></br>
                <progress className="progress is-small" value={this.state.progress} max="1"></progress>
                <div>
                  Status: {this.state.message}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
