import React, { Component } from 'react';
import '../node_modules/bulma/css/bulma.css';

import Dropzone from 'dropzone';

class App extends Component {
  constructor() {
    super()

    this.state = {
      filename: '',
      totalBytes: '',
      totalBytesSent: '',
      uploadId: null
    }

    this.registerDropzone = this.registerDropzone.bind(this)
    this.handleUpdateFilename = this.handleUpdateFilename.bind(this)
    this.handleUpdateProgress = this.handleUpdateProgress.bind(this)
  }

  componentDidMount() {
    // Register dropzone function
    this.registerDropzone()
  }

  registerDropzone = () => {
    var myDropzone = new Dropzone("#fileUploadInput", { 
      url: "http://localhost:8000/upload/",
      headers: {
        'Cache-Control': null
      },
      uploadMultiple: false,
      chunking: true,
      forceChunking: true,
      params: function(files, xhr, chunk) {
        this.handleUpdateProgress(xhr, chunk)
      }.bind(this),
      chunksUploaded: function(file, done) {
        // Tell the server that it completed the function
        this.handleChunksUploaded()
      }.bind(this)
    });

    myDropzone.on("addedfile", function(file) {
      this.handleUpdateFilename(file.name)
    }.bind(this))
  }
  
  handleUpdateFilename(filename) {
    this.setState({filename: filename})
  }

  handleUpdateProgress(xhr, chunk) {
    // xhr response only available after returns the response
    xhr.addEventListener("progress", function(event) {
      const parsedResponse = JSON.parse(xhr.response)
      console.log(parsedResponse)
      this.setState({
        uploadId: parsedResponse.upload_id,
        totalBytes: chunk.progress,
        totalBytesSent: chunk.index
      })
    }.bind(this))
  }

  handleChunksUploaded() {
    fetch('http://localhost:8000/upload_complete/', {
      method: 'POST',
      body: JSON.stringify({upload_id: this.state.uploadId})
    })
    .then(res => res.json())
    .then(response => console.log(response))
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
                  <div className="file has-name is-fullwidth">
                    <label className="file-label">
                      <input className="file-input" id="fileUploadInput" type="file" name="resume" />
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
                </form>
                <br></br>
                <progress className="progress is-small" value={this.state.totalBytesSent} max="100">15%</progress>
                <div>
                  Status: Message
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
