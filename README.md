## Slides for my talk at JSNext 2014.

In order to run the slides you will need to start the signaling server for the webrtc demo:

```bash
git clone git@github.com:mgechev/webrtc-demo-jsnext.git
cd webrtc-demo-jsnext
npm install
node index.js
```

After that you can clone the repo with the slides and run the grunt server task:

```bash
git clone git@github.com:mgechev/webrtc-slides-jsnext.git
cd webrtc-slides-jsnext
npm install
# npm install -g grunt # if you don't have it already installed.
bower install
grunt server
```

Note that you might need to run the `npm install` command with `sudo`.

## The demo with the VMs in the iPad won't work.
## The websockets demo won't work.
