const allFiles = new Set();

let progress;
let saved;

window.onload = () => {
  progress = document.querySelector("#prog");
  saved = document.querySelector("#saved");
};

function dragLeaveHandler(event) {
  console.log("drag leave");
  // Set style of drop zone to default
  event.target.classList.remove("draggedOver");
}

function dragEnterHandler(event) {
  console.log("Drag enter");
  // Show some visual feedback
  event.target.classList.add("draggedOver");
}

function dragOverHandler(event) {
  //console.log("Drag over a droppable zone");
  // Do not propagate the event
  event.stopPropagation();
  // Prevent default behavior, in particular when we drop images or links
  event.preventDefault();
}

function dropHandler(event) {
  console.log("drop event");

  // Do not propagate the event
  event.stopPropagation();
  // Prevent default behavior, in particular when we drop images or links
  event.preventDefault();

  // reset the visual look of the drop zone to default
  event.target.classList.remove("draggedOver");

  // get the files from the clipboard
  var files = event.dataTransfer.files;
  var filesLen = files.length;
  var filenames = "";

  // iterate on the files, get details using the file API
  // Display file names in a list.
  for (var i = 0; i < filesLen; i++) {
    filenames += "\n" + files[i].name;
    // Create a li, set its value to a file name, add it to the ol
    var li = document.createElement("li");
    li.textContent = files[i].name;
    document.querySelector("#droppedFiles").appendChild(li);
  }
  console.log(files.length + " file(s) have been dropped:\n" + filenames);

  readFilesAndDisplayPreview(files);
}

function readFilesAndDisplayPreview(files) {
  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; (f = files[i]); i++) {
    // Only process image files.
    if (!f.type.match("image.*")) {
      continue;
    }

    var dataReader = new FileReader();

    //capture the file information.
    dataReader.onload = function(e) {
      // Render thumbnail.
      var span = document.createElement("span");
      span.innerHTML =
        "<img class='thumb' width='100' src='" + e.target.result + "'/>";
      document.getElementById("list").insertBefore(span, null);
    };

    // Read the image file as a data URL.
    dataReader.readAsDataURL(f);
    allFiles.add(f);
  }
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object
  // do something with files... why not call readFilesAndDisplayPreview!
  readFilesAndDisplayPreview(files);
}

function handleUploadClick(e) {
  const form = new FormData();
  for (let files of allFiles) {
    if (files instanceof FileList) {
      for (let file of files) {
        form.append("file", file);
      }
    } else {
      form.append("file", files);
    }
  }
  uploadAllFilesUsingAjax(form);
}

function uploadAllFilesUsingAjax(form) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload");
  xhr.upload.onprogress = function(e) {
    progress.value = e.loaded;
    progress.max = e.total;
  };
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        const list = document.createElement("ul");
        res.forEach(item => {
          const i = document.createElement("li");
          i.innerHTML = `${item.originalname} --> ${item.path}`;
          list.appendChild(i);
        });
        saved.appendChild(list);
      }
    }
  };

  // Send the Ajax request
  console.log(form);
  xhr.send(form);
}
