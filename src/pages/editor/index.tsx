import React, { useState, useCallback, useMemo, useEffect } from 'react';
// import logo from "./logo.svg";
// import { Button, TextField } from "@material-ui/core";
// import { Responsive, WidthProvider } from "react-grid-layout";
import { useDebounceFn, useUnmount } from '@umijs/hooks';
import lodash from 'lodash';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import short from 'short-uuid';
import { Slate, Editable, withReact } from 'slate-react';
import {
  Node,
  Editor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
  Text,
  Path,
} from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  pipe,
  // withDeserializeHTML,
  withDeserializeMd,
  SoftBreakPlugin,
  withAutoformat,
  BalloonToolbar,
  withNodeID,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  CodeBlockPlugin,
  HighlightPlugin,
  StrikethroughPlugin,
  ParagraphPlugin,
  BlockquotePlugin,
  HeadingPlugin,
  CodePlugin,
  ImagePlugin,
  LinkPlugin,
  ListPlugin,
  MediaEmbedPlugin,
  MentionPlugin,
  TablePlugin,
  getSelectableElement,
  withTable,
  withLink,
  withInlineVoid,
  withList,
  withMarks,
  withImageUpload,
  withNormalizeTypes,
  // withTrailingNode,
  TodoListPlugin,
  ResetBlockTypePlugin,
  ExitBreakPlugin,
  useMention,
  MentionSelect,
  ToolbarMark,
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  MARK_CODE,
  MARK_KBD,
  MARK_STRIKETHROUGH,
  ELEMENT_LINK,
  ToolbarLink,
  getAboveByType,
  upsertLinkAtSelection,
  isCollapsed,
  deserializeHTMLToDocumentFragment,
  parseMD,
  SlateDocumentFragment,
  // Serialize,
  // deSerializemar
} from '@udecode/slate-plugins';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  Link,
} from '@material-ui/icons';
import rendererIpc from '@/utils/rendererIpc';
import { useRecoilState } from 'recoil';
import { editorPluginListState, PageData, pageDataState } from '@/store/atoms';
import { useDispatch, useStore } from '@/store/reducer-provider';
import KEYS from '@/store/keys';
import {
  initialValueBasicMarks,
  initialValueForcedLayout,
  initialValueHighlight,
  initialValueBasicElements,
  initialValueList,
  initialValueTables,
  initialValueLinks,
  initialValueMentions,
  initialValueImages,
  initialValueEmbeds,
  initialValueAutoformat,
  initialValueSoftBreak,
  initialValueExitBreak,
  initialValuePasteHtml,
  options as defaultOptions,
  optionsResetBlockTypes,
  headingTypes,
} from './initialValues';
import { autoformatRules } from './autoformatRules';
import { MENTIONABLES } from './mentionables';

const { ipcRenderer, clipboard } = window.require('electron');
// Node.fra
// TODO:NormalizeTypes,TrailingNode,SerializeHtml
// Editor.above
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === 'code',
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true },
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: (n) => Editor.isBlock(editor, n) },
    );
  },
};
// 定义可拖拽的类型，可以嵌套
const draggableComponentOptions = [
  { ...defaultOptions.p, level: 1 },
  defaultOptions.blockquote,
  defaultOptions.todo_li,
  defaultOptions.h1,
  defaultOptions.h2,
  defaultOptions.h3,
  defaultOptions.h4,
  defaultOptions.h5,
  defaultOptions.h6,
  defaultOptions.img,
  defaultOptions.link,
  defaultOptions.ol,
  defaultOptions.ul,
  // defaultOptions.li,
  defaultOptions.table,
  defaultOptions.media_embed,
  defaultOptions.code_block,
].map(
  ({ type, level, component, ...options }: { type: string; level?: number; component: any }) => [
    type,
    {
      ...options,
      component: getSelectableElement({
        component,
        level,
        dragIcon: (
          <DragIndicatorIcon
            style={{
              width: 18,
              height: 18,
              color: 'rgba(55, 53, 47, 0.3)',
            }}
          />
        ),
        styles: {
          blockAndGutter: {
            padding: '4px 0',
          },
          blockToolbarWrapper: {
            height: '1.5em',
          },
        },
      }),
      rootProps: {
        styles: {
          root: {
            margin: 0,
            lineHeight: '1.5',
          },
        },
      },
    },
  ],
);

const options = {
  ...defaultOptions,
  ...Object.fromEntries(draggableComponentOptions),
};

const plugins = [
  ParagraphPlugin(options),
  BlockquotePlugin(options),
  TodoListPlugin(options),
  ImagePlugin(options),
  LinkPlugin(options),
  ListPlugin(options),
  MentionPlugin(options),
  TablePlugin(options),
  MediaEmbedPlugin(options),
  CodeBlockPlugin(options),
  CodePlugin(options),
  HighlightPlugin(options),
  StrikethroughPlugin(options),
  ResetBlockTypePlugin(optionsResetBlockTypes),
  HeadingPlugin(options),
  BoldPlugin(options),
  ItalicPlugin(options),
  UnderlinePlugin(options),
  SoftBreakPlugin({
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [options.code_block.type, options.blockquote.type, options.td.type],
        },
      },
    ],
  }),
  ExitBreakPlugin({
    rules: [
      {
        hotkey: 'mod+enter',
      },
      {
        hotkey: 'mod+shift+enter',
        before: true,
      },
      {
        hotkey: 'enter',
        query: {
          start: true,
          end: true,
          allow: headingTypes,
        },
      },
    ],
  }),
];
const withPlugins = [
  withReact,
  withHistory,
  withTable(options),
  withLink(),
  withList(options),
  // withDeserializeMd({ plugins }),
  // withDeserializeHTML({ plugins }),
  withMarks(),
  withImageUpload(),
  withAutoformat({ rules: autoformatRules }),
  withNodeID({ idCreator: short.generate }),
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: options.h1.type }],
  }),
  // withTrailingNode({ type: options.p.type, level: 1 }),
  withInlineVoid({ plugins }),
] as const;
// const withPlugins = [withShortcuts, withReact, withHistory] as const;

const initialValue: any[] = [
  ...initialValueForcedLayout,
  ...initialValueBasicMarks,
  ...initialValueHighlight,
  ...initialValueBasicElements,
  ...initialValueList,
  ...initialValueTables,
  ...initialValueLinks,
  ...initialValueMentions,
  ...initialValueImages,
  ...initialValueEmbeds,
  ...initialValueAutoformat,
  ...initialValueSoftBreak,
  ...initialValueExitBreak,
  ...initialValuePasteHtml,
];
const setNodeId = (nodes: any[]) => {
  nodes.forEach((node) => {
    const children = node.children as any[];
    children?.forEach((block) => {
      // eslint-disable-next-line no-param-reassign
      block.id = short.generate();
    });
  });
};

setNodeId(initialValue);

const inlineTypes = plugins.reduce((arr, plugin) => {
  const types = plugin.inlineTypes || [];
  return arr.concat(types);
}, []);

function Page({ match }) {
  const title: string = match.params.id;
  const [slatePluginList, setSlatePluginList] = useRecoilState(editorPluginListState);
  // const [pageData, dispatch({type:KEYS.PAGE_DATA,payload:pageData})] = useRecoilState(pageDataState);
  // const [pageData, dispatch({type:KEYS.PAGE_DATA,payload:pageData})] = useState(null);
  const { pageData } = useStore();
  console.log('🚀 ~ file: index.tsx ~ line 327 ~ Page ~ pageData', pageData);
  const dispatch = useDispatch();
  // const layouts = getLayoutsFromSomewhere();
  // const decorate: any = [];
  // const [value, setValue] = useState<Node[]>([]);
  // const [meta, setMeta] = useState({});
  // JSON.parse(localStorage.getItem('content')) || initialValue,
  useDebounceFn(
    () => {
      rendererIpc.sendToMain('modifyFileJson', title, pageData);
    },
    [pageData],
    1000,
  );
  const {
    index,
    search: mentionSearch,
    target,
    values,
    onChangeMention,
    onKeyDownMention,
  } = useMention(MENTIONABLES, {
    maxSuggestions: 10,
  });

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const onKeyDown = [onKeyDownMention];

  useEffect(() => {
    console.log('🚀 ~ file: index.tsx ~ line 340 ~ useEffect');
    const clipboardStrHandle = (event, oldString) => {
      const formats = clipboard.availableFormats();
      formats.unshift('text/plain'); // 兜底

      lodash.findLast(formats, executeFormat(editor));

      // clipboard.writeText(oldString);// TODO: 恢复
    };
    const extensionHtmlHandle = (event, html) => {
      appendHTMLStrToEditor(html, editor);
      // clipboard.writeText(oldString);// TODO: 恢复
    };
    rendererIpc.receiveFromMain.addListener('clipboard-text', clipboardStrHandle);
    rendererIpc.receiveFromMain.addListener('extension-html', extensionHtmlHandle);
    // TODO: 黏贴文本的钩子 抽离到插件
    const { insertData } = editor;

    editor.insertData = (data) => {
      const formats = [...data.types];
      formats.unshift('text/plain'); // 兜底
      const result = lodash.findLast(formats, (type) => {
        const clipboardData = data.getData(type);
        // return !!result;

        switch (type) {
          case 'vscode-editor-data':
            appendTextStrToEditor(data.getData('text/plain'), editor); // TODO: 临时处理
            return true;
          case 'text/html':
            appendHTMLStrToEditor(clipboardData, editor);
            return true;
          case 'text/plain':
            appendTextStrToEditor(clipboardData, editor);
            return true;
          default:
            return false;
        }
      });
      if (!result) {
        insertData(data);
      }
    };
    //  ===== 加载数据
    // TODO: 调用过程抽象
    const loadJsonHandle = (event, json) => {
      console.log('🚀 ~ file: index.tsx ~ line 403 ~ loadJsonHandle ~ json', json);
      // TODO:可以合并减少一次render
      // setValue(json.block);
      // setMeta(json.meta);
      dispatch({ type: KEYS.PAGE_DATA, payload: json });
    };
    rendererIpc.sendToMain('loadFileJson', title);
    rendererIpc.receiveFromMain.addListener('loadFileJson', loadJsonHandle);

    return () => {
      rendererIpc.receiveFromMain.removeListener('clipboard-text', clipboardStrHandle);
      rendererIpc.receiveFromMain.removeListener('extension-html', extensionHtmlHandle);
      rendererIpc.receiveFromMain.removeListener('loadFileJson', loadJsonHandle);
    };
  }, [editor, title, dispatch]);

  useEffect(() => {
    dispatch({ type: KEYS.EDITOR, payload: editor });

    return () => {
      dispatch({ type: KEYS.PAGE_DATA, payload: null });
      dispatch({ type: KEYS.EDITOR, payload: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        {pageData && (
          <Slate
            editor={editor}
            value={pageData.block}
            onChange={(val) => {
              // setValue(val);
              dispatch({
                type: KEYS.PAGE_DATA,
                payload: {
                  ...pageData,
                  block: val,
                },
              });
              onChangeMention(editor);
            }}
          >
            <div>4ww</div>
            <MentionSelect at={target} valueIndex={index} options={values} />
            <BalloonToolbar arrow>
              <ToolbarMark
                reversed
                type={MARK_BOLD}
                icon={<FormatBold />}
                tooltip={{ content: 'Bold (⌘B)' }}
              />
              <ToolbarMark
                reversed
                type={MARK_ITALIC}
                icon={<FormatItalic />}
                tooltip={{ content: 'Italic (⌘I)' }}
              />
              <ToolbarMark
                reversed
                type={MARK_UNDERLINE}
                icon={<FormatUnderlined />}
                tooltip={{ content: 'Underline (⌘U)' }}
              />
              <ToolbarMark
                reversed
                type={MARK_CODE}
                icon={<Code />}
                tooltip={{ content: 'Underline (⌘U)' }}
              />
              <ToolbarMark
                reversed
                type={MARK_STRIKETHROUGH}
                icon={<FormatStrikethrough />}
                tooltip={{ content: 'Underline (⌘U)' }}
              />
              {/* <ToolbarMark
							reversed
							type={ELEMENT_LINK}
							icon={<Link />}
							tooltip={{ content: "Underline (⌘U)" }}
						/> */}
              <ToolbarLink
                onMouseDown={(event) => {
                  // Object.assign
                  event.preventDefault();
                  let prevUrl = '';
                  const url = '';
                  const linkNode = getAboveByType(editor, options.link.type);

                  if (linkNode) {
                    prevUrl = linkNode[0].url as string;
                  }

                  // TODO: 使用js弹窗 https://material-ui.com/zh/components/dialogs/
                  // const url = window.prompt(
                  // 	`Enter the URL of the link:`,
                  // 	prevUrl
                  // );
                  if (!url) return; // If our cursor is in middle of a link, then we don't want to inser it inline

                  const shouldWrap = linkNode !== undefined && isCollapsed(editor.selection);
                  upsertLinkAtSelection(editor, url, {
                    wrap: shouldWrap,
                    ...options,
                  });
                }}
                icon={<Link />}
              />
            </BalloonToolbar>
            <EditablePlugins
              spellCheck={false}
              plugins={[...plugins, ...slatePluginList]}
              renderElementDeps={[slatePluginList.length]}
              onKeyDownDeps={[slatePluginList.length]}
              placeholder="Enter some text..."
              onKeyDown={onKeyDown}
              // onKeyDownDeps={[index, mentionSearch, target]}
              autoFocus
            />
          </Slate>
        )}
      </DndProvider>
    </div>
  );
}

export default Page;
function executeFormat(editor): lodash.ListIterateeCustom<string, boolean> {
  return (type) => {
    const vscodeData = clipboard.read(type);
    const html = clipboard.readHTML();
    const content = clipboard.readText();
    switch (type) {
      case 'vscode-editor-data':
        // "vscode-editor-data" 没办法直接读取数据，统一处理成block块
        appendTextStrToEditor(clipboard.readText(), editor); // TODO: 临时处理
        return true;
      case 'text/html':
        appendHTMLStrToEditor(html, editor);
        return true;
      case 'text/plain':
        appendTextStrToEditor(content, editor);
        return true;
      default:
        return false;
    }
  };
}

function appendHTMLStrToEditor(html: string, editor) {
  if (html) {
    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const fragment: SlateDocumentFragment = deserializeHTMLToDocumentFragment({
      plugins,
      element: body,
    });

    Transforms.insertNodes(
      editor,
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
      { select: true },
    );
    const firstNodeType = fragment[0].type;
    if (firstNodeType && !inlineTypes.includes(firstNodeType)) {
      Transforms.setNodes(editor, {
        type: fragment[0].type,
      });
    }
    Transforms.insertFragment(editor, fragment);
  }
}
function appendTextStrToEditor(content: string, editor) {
  if (content) {
    const fragment = parseMD(options)(content);
    if (!fragment.length) return;

    Transforms.insertNodes(
      editor,
      {
        type: 'p',
        children: [
          {
            text: '',
          },
        ],
      },
      { select: true },
    );

    if (fragment[0].type) {
      Transforms.setNodes(editor, {
        type: fragment[0].type,
      });
    }
    Transforms.insertFragment(editor, fragment);
  }
}
