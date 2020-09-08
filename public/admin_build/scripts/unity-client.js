frameReceived = (frameProps) => {
  const id = frameProps.cameraId;
  var surface = document.getElementById(`surface${id}`);
  if (surface) {
    var imageNode = surface.childNodes[0];
    imageNode.src = `data:image/png;base64, ${frameProps.frame}`;
    imageNode.style = "object-fit: cover; width: inherit; height: inherit;";
  }
};

dangerTrigger = (dangerProps) => {
  console.log("Fire");
  var surface = document.getElementById(`cam${dangerProps.cameraId}`);
  if (surface) {
    surface.style = "background-color: #f11;";
  }
};

addCameraToList = (id) => {
  var list = document.getElementById("camera-list-ul");
  var li = document.createElement("li");
  li.id = `cam${id}`;
  var div = document.createElement("div");
  div.className = "security-camera";
  div.id = `surface${id}`;
  var textNode = document.createTextNode("Camera ID: ");
  var camIdText = document.createElement("b");
  camIdText.innerHTML = `${id}`;
  var imageNode = document.createElement("img");
  $(div).on("dragstart", () => false);
  div.appendChild(imageNode);
  li.append(div);
  li.appendChild(textNode);
  li.appendChild(camIdText);
  list.appendChild(li);
};

removeCameraFromList = (id) => {
  var toRemove = document.getElementById(`cam${id}`);
  if (toRemove) {
    toRemove.remove();
  }
};

const bindings = {
  onCameraInit: (props) => {
    unityInstance.SendMessage("__IO__", "OnCameraInit", JSON.stringify(props));
    addCameraToList(props.cameraId);
    $.toast("Connected to camera " + props.cameraId);
  },
  onCameraRemove: (props) => {
    unityInstance.SendMessage(
      "__IO__",
      "OnCameraRevoke",
      JSON.stringify(props)
    );
    removeCameraFromList(props.cameraId);
  },
  onVisitorInit: (props) => {
    unityInstance.SendMessage("__IO__", "OnVisitorInit", JSON.stringify(props));
  },
  onVisitorRemove: (props) => {
    unityInstance.SendMessage(
      "__IO__",
      "OnVisitorRevoke",
      JSON.stringify(props)
    );
  },
  onLocation: (props) => {
    unityInstance.SendMessage(
      "__IO__",
      "OnLocationUpdate",
      JSON.stringify(props)
    );
  },
  onFrame: (props) => {
    unityInstance.SendMessage("__IO__", "OnFrameUpdate", JSON.stringify(props));
    frameReceived(props);
  },
  onDanger: (props) => {
    unityInstance.SendMessage(
      "__IO__",
      "OnDangerTrigger",
      JSON.stringify(props)
    );
    dangerTrigger(props);
    $.toast({
      text: "Warning! A fire has been detected!",
      bgColor: "red",
      hideAfter: false,
    });
  },
  connect: () => {
    unityInstance.SendMessage("__IO__", "OnConnect");

    $.toast({
      text: "Web client connected!",
      bgColor: "black",
    });
  },
  disconnect: () => {
    unityInstance.SendMessage("__IO__", "OnDisconnect");

    $.toast({
      text: "Web client disconnected!",
      bgColor: "red",
      hideAfter: false,
    });
  }
};

function startAdminClient() {
  const socket = io("http://127.0.0.1:9000?device=admin", {
    reconnection: false,
  });
  socket.on("connect", bindings.connect);
  socket.on("camera_init", bindings.onCameraInit);
  socket.on("camera_revoke", bindings.onCameraRemove);
  socket.on("visitor_init", bindings.onVisitorInit);
  socket.on("visitor_revoke", bindings.onVisitorRemove);
  socket.on("location_update", bindings.onLocation);
  socket.on("frame", bindings.onFrame);
  socket.on("danger", bindings.onDanger);
  socket.on("disconnect", bindings.disconnect);
}