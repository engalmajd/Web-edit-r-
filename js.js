var main = document.getElementById("main");
var editorContainer = document.getElementById("editorContainer");
var editorResult = document.getElementById("editorResult");
var editorResultContainer = document.getElementById("editorResultContainer");
var body = document.body,
  html = document.documentElement;
var menuHeight = document.getElementById("menu").offsetHeight;
var downloadCode = document.getElementById("downloadCode");
var run = document.getElementById("run");
var dragbar = document.getElementById("dragbar");
var iframeResult = document.getElementById("iframeResult");
var dimensions = document.getElementById("dimensions");
var selectedTheme = localStorage.getItem("codeMirrorSelectedTheme");
var selectedView = localStorage.getItem("codeMirrorSelectedView");
var showCode; // this for mobile view only

var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "htmlmixed",
  theme: getEditorTheme(),
  lineNumbers: true,
  indentUnit: 4,
  placeholder: "Kod için belirlenen yer",
  extraKeys: {
    Tab: function (cm) {
      cm.replaceSelection("    ", "end");
    },
  },
});

function runCode() {
  var iframe = iframeResult;
  iframe = iframe.contentWindow
    ? iframe.contentWindow
    : iframe.contentDocument
    ? iframe.contentDocument.document
    : iframe.contentDocument;
  iframe.document.open();
  iframe.document.write(editor.getValue());
  iframe.document.close();
}

function screenAdjustment() {
  $("#container").height($(body).height());

  if (isUsingMobile()) {
    $("#menu").css({
      width: "40px",
      height: $(window).height() + "px",
      "margin-bottom": "0px",
      "margin-right": "4px",
      "margin-left": "0px",
      "padding-top":
        ($(window).height() - $("#menu").children().length * 42) / 2 + "px",
    });

    $("#menu li").width(38);
    $("#main").css({
      width: $("#container").width() - $("#menu").width() - 5,
      height: $("#container").height() - 10,
    });
    $("#toggleView").css("display", "none");
    $("#toggleCodeResultMobile").css("display", "block");
    $(".tooltiptext").addClass("tooltiptext-right");
    $(".tooltiptext").removeClass("tooltiptext-bottom");
  } else {
    $("#editorContainer, #editorResultContainer").css("display", "block");
    $("#menu").css({
      width: "100%",
      height: "36px",
      "margin-bottom": "5px",
      "margin-right": "0px",
      "margin-left": $("#container").width() / 2 - 125 - 13 + "px",
      "padding-top": "0px",
    });
    $("#menu li").width(50);
    $("#main").css({
      width: "100%",
      height: $("#container").height() - $("#menu").height() - 15,
    });
    $("#toggleView").css("display", "block");
    $("#toggleCodeResultMobile").css("display", "none");
    $(".tooltiptext").addClass("tooltiptext-bottom");
    $(".tooltiptext").removeClass("tooltiptext-right");
  }

  if (isUsingMobile()) {
    if ($("#editorContainer").css("z-index") == 2) {
      $("#editorResultContainer").css("z-index", 1);
      showCode = true;
    } else if ($("#editorResultContainer").css("z-index") == 2) {
      $("#editorContainer").css("z-index", 1);
      showCode = false;
    } else {
      $("#editorContainer").css("z-index", 1);
      $("#editorResultContainer").css("z-index", 2);
      showCode = true;
    }
    $("#editorResultContainer").height("100%");
    $("#editorResultContainer").width($("#main").width());
    $("#editorContainer").height("100%");
    $("#editorContainer").width($("#main").width());
    $("#editorContainer").css("margin", "0");

    $("#dragbar").css("left", $("#editorResultContainer").position().left - 5);
  } else {
    if (selectedView == "rows") {
      editorContainer.style.marginBottom = "5px";
      editorContainer.style.width = "100%";
      editorResultContainer.style.width = "100%";
      editorContainer.style.height = main.offsetHeight / 2 - 10 + "px";
      editorResultContainer.style.height = main.offsetHeight / 2 + 5 + "px";
      $("#dragbar").css({
        cursor: "row-resize",
        top: $("#editorResultContainer").position().top - 5,
        left: 0,
        width: "100%",
        height: 5,
      });
    } else {
      editorContainer.style.marginRight = "5px";
      editorContainer.style.width = main.offsetWidth / 2 - 5 + "px";
      editorResultContainer.style.width = main.offsetWidth / 2 + "px";
      editorContainer.style.height = "100%";
      editorResultContainer.style.height = "100%";
      $("#dragbar").css({
        cursor: "col-resize",
        top: 0,
        left: $("#editorResultContainer").position().left - 5,
        height: "100%",
        width: 5,
      });
    }
  }

  editor.setSize("100%", "100%");
  main.style.visibility = "visible";

  dimensions.style.display = $(window).width() < 500 ? "none" : "block";
  displayDimensions();
}

function displayDimensions() {
  dimensions.innerHTML =
    editorResult.offsetWidth + " × " + editorResult.offsetHeight;
}

function isUsingMobile() {
  return $(window).width() <= 468 ? true : false;
}

function getEditorTheme() {
  if (localStorage.getItem("codeMirrorSelectedTheme") == "white") {
    $("body").removeClass("dark");
    return "default";
  } else {
    $("body").addClass("dark");
    return "panda-syntax";
  }
}

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    // this transparent div is very important to optimze performance on dragging
    // because the iframe is not detect any mouse move or click
    $("#iframeFix").css("display", "block");

    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position + set editor & result size
    if (selectedView == "rows") {
      if (pos4 > body.offsetHeight - 40 || pos4 < 80) {
        return;
      }
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = "0px";
      editorContainer.style.height = elmnt.offsetTop + "px";
      editorResultContainer.style.height =
        main.offsetHeight - elmnt.offsetTop - 5 + "px";
    } else {
      if (pos3 < 60 || pos3 > body.offsetWidth - 60) {
        return;
      }
      elmnt.style.top = "0px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
      editorContainer.style.width = elmnt.offsetLeft + "px";
      editorResultContainer.style.width =
        main.offsetWidth - elmnt.offsetLeft - 5 + "px";
    }

    displayDimensions();
  }

  function closeDragElement() {
    $("#iframeFix").css("display", "none");
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Make the DIV element draggagle:
dragElement(dragbar);

$(document).ready(function () {
  if (!selectedTheme) {
    localStorage.setItem("codeMirrorSelectedTheme", "dark");
  }

  if (!selectedView) {
    localStorage.setItem("codeMirrorSelectedView", "rows");
  }

  selectedView = localStorage.getItem("codeMirrorSelectedView");

  $("#downloadCode").click(function () {
    var textFile = null,
      makeTextFile = function (text) {
        var data = new Blob([text], { type: "text/plain" });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
      };

    var create = document.getElementById("downloadCode");

    a = document.createElement("a"); // Create link.
    document.body.appendChild(a); // Set link on DOM.
    a.style = "display: none"; // Make link unvisible on the screen.
    a.href = makeTextFile(editor.getValue()); // Set href on link.
    a.setAttribute("download", "webeditor.html"); // To open the download dialog
    a.click(); // Trigger click of link.
  });

  $("#run").click(function () {
    if (isUsingMobile()) {
      showCode = false;
      $("#toggleCodeResultMobile").click();
    }
    runCode();
  });

  $("#toggleView").click(function () {
    localStorage.setItem(
      "codeMirrorSelectedView",
      selectedView == "rows" ? "cols" : "rows"
    );
    selectedView = localStorage.getItem("codeMirrorSelectedView");
    screenAdjustment();
  });

  $("#toggleTheme").click(function () {
    localStorage.setItem(
      "codeMirrorSelectedTheme",
      selectedTheme == "white" ? "dark" : "white"
    );
    editor.setOption("theme", getEditorTheme());
    selectedTheme = localStorage.getItem("codeMirrorSelectedTheme");
  });

  $("#toggleCodeResultMobile").click(function () {
    if (showCode == true) {
      $("#editorResultContainer").css("z-index", 1);
      $("#editorContainer").css("z-index", 2);
      showCode = false;
    } else {
      $("#editorResultContainer").css("z-index", 2);
      $("#editorContainer").css("z-index", 1);
      showCode = true;
    }
    $("#dragbar").css("left", $("#editorResultContainer").position().left - 5);
  });

  $("#menu").css("display", "block");
  screenAdjustment();
  runCode();
});

$(window).on("load", function () {
  screenAdjustment();
});

$(window).on("resize", function () {
  screenAdjustment();
});
