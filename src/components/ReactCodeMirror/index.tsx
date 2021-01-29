import React, { useRef, useEffect, useImperativeHandle, useState, useMemo } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/meta';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/keymap/sublime';
// import 'codemirror/theme/monokai.css';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import jsonlint from 'jsonlint-mod';

// import 'codemirror/addon/lint/javascript-lint';
window.jsonlint = jsonlint;

const defaultOptions = {
  tabSize: 2,
  autoCloseBrackets: true,
  matchBrackets: true,
  showCursorWhenSelecting: true,
  // 显示行号
  lineNumbers: true,
  fullScreen: true,
  keyMap: 'sublime',
  lint: true,
  // gutters: ['CodeMirror-lint-markers'],
  // mode: { name: 'javascript', json: true },
  mode: 'application/json',
};

function ReactCodeMirror(props = {}, ref) {
  const { options = {}, value = '', width = '100%', height = '100%' } = props;
  const [editor, setEditor] = useState(null);
  const textareaRef = useRef();
  useImperativeHandle(ref, () => ({ editor }), [editor]);
  // 将props中所有的事件处理函数映射并保存
  function getEventHandleFromProps() {
    const propNames = Object.keys(props);
    const eventHandle = propNames.filter((keyName) => {
      return /^on+/.test(keyName);
    });

    const eventDict = {};
    eventHandle.forEach((ele) => {
      const name = ele.slice(2);
      eventDict[ele] = name.replace(name[0], name[0].toLowerCase());
    });

    return eventDict;
  }

  // http://codemirror.net/doc/manual.html#config
  async function setOptions(instance, opt = {}) {
    if (typeof opt === 'object' && window) {
      const mode = CodeMirror.findModeByName(
        typeof opt.mode === 'object' ? opt.mode.name : opt.mode || '',
      );
      if (mode && mode.mode) {
        // await import(`codemirror/mode/${mode.mode}/${mode.mode}.js`);
      }
      if (mode) {
        opt.mode = mode.mime;
      }
      Object.keys(opt).forEach((name) => {
        if (opt[name] && JSON.stringify(opt[name])) {
          instance.setOption(name, opt[name]);
        }
      });
    }
  }

  useEffect(() => {
    if (!editor && window) {
      // 生成codemirror实例
      const instance = CodeMirror.fromTextArea(textareaRef.current, {
        ...defaultOptions,
        ...options,
      });
      const eventDict = getEventHandleFromProps();
      Object.keys(eventDict).forEach((event) => {
        instance.on(eventDict[event], props[event]);
      });
      instance.setValue(value || '');

      if (width || height) {
        // 设置尺寸
        instance.setSize(width, height);
      }
      setEditor(instance);
      setOptions(instance, { ...defaultOptions, ...options });
    }
    return () => {
      if (editor && window) {
        editor.toTextArea();
        setEditor(undefined);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMemo(() => {
    if (!editor || !window) return;
    const val = editor.getValue();
    if (value !== undefined && value !== val) {
      editor.setValue(value);
    }
  }, [value, editor]);

  useMemo(() => {
    if (editor != null && window != null) {
      editor.setSize(width, height);
    }
  }, [width, height, editor]);

  useMemo(() => {
    if (!editor || !window) return;
    setOptions(editor, { ...defaultOptions, ...options });
  }, [options, editor]);

  return <textarea ref={textareaRef} />;
}
export default React.forwardRef(ReactCodeMirror);
