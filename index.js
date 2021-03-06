function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// store
const options = {
  mode: 'tree',
  modes: ['code', 'tree'], // allowed modes
  onError: function (err) {
    alert(err.toString());
  },
  onModeChange: function (newMode, oldMode) {
    console.log('Mode switched from', oldMode, 'to', newMode);
  },
};
const editor = new JSONEditor(document.getElementById("jsoneditor"), options);

const json = {
  "Array": [1, 2, 3],
  "Boolean": true,
  "Null": null,
  "Number": 123,
  "Object": {"a": "b", "c": "d"},
  "String": "Hello World"
};
editor.set(json);

//output
const outputEditor = new JSONEditor(document.getElementById("output_editor"), options);

// Load a JSON document
FileReaderJS.setupInput(document.getElementById('loadDocument'), {
  readAsDefault: 'Text',
  on: {
    load: function (event, file) {
      editor.setText(event.target.result);
    }
  }
});

// Save a JSON document
document.getElementById('saveDocument').onclick = function () {
  // Save Dialog
  let fname = window.prompt("Save as...");

  // Check json extension in file name
  if (fname.indexOf(".") === -1) {
    fname = fname + ".json";
  } else {
    if (fname.split('.').pop().toLowerCase() === "json") {
      // Nothing to do
    } else {
      fname = fname.split('.')[0] + ".json";
    }
  }
  const blob = new Blob([editor.getText()], {type: 'application/json;charset=utf-8'});
  saveAs(blob, fname);
};

const makeImmutable = state => {
  const newState = {};
  Object.keys(state).map(key => {
    newState[key] = Immutable.fromJS(state[key]);
  });
  return newState;
};

//input editor
const inputEditor = ace.edit("editor");
inputEditor.setTheme("ace/theme/monokai");
inputEditor.getSession().setMode("ace/mode/javascript");

const myEfficientFn = debounce(function () {
  const value = inputEditor.getSession().getValue();
  console.log(`(function (state) {${value}}`);
  try {
    const output = window.eval.call(window, `(function (state) {${value}})`)(makeImmutable(editor.get()));
    outputEditor.set(output);
    document.getElementById('error').innerHTML = '';
  }
  catch (e) {
    document.getElementById('error').innerHTML = e;
  }
}, 500);

inputEditor.getSession().on('change', myEfficientFn);