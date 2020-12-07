import React, { useState, useCallback, useMemo } from "react";
// import logo from "./logo.svg";
import "./App.css";
// import { Button, TextField } from "@material-ui/core";
import { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";
import lodash from "lodash";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Slate, Editable, withReact } from "slate-react";
import {
	Node,
	Editor,
	Transforms,
	Range,
	Point,
	createEditor,
	Element as SlateElement,
	Text,
} from "slate";
import { withHistory } from "slate-history";
import {
	EditablePlugins,
	pipe,
	withDeserializeHTML,
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
	withTrailingNode,
	TodoListPlugin,
	ResetBlockTypePlugin,
	ExitBreakPlugin,
	useMention,
	MentionSelect,
	ToolbarMark,
	MARK_BOLD,
	MARK_ITALIC,
	MARK_UNDERLINE,
} from "@udecode/slate-plugins";
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
} from "./initialValues";
import { autoformatRules } from "./autoformatRules";
import { MENTIONABLES } from "./mentionables";
import { FormatBold, FormatItalic, FormatUnderlined } from "@material-ui/icons";

// console.log(options.h1);
// TODO:NormalizeTypes,TrailingNode,SerializeHtml

const ResponsiveGridLayout = WidthProvider(Responsive);

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
			match: (n) => n.type === "code",
		});

		return !!match;
	},

	toggleBoldMark(editor) {
		const isActive = CustomEditor.isBoldMarkActive(editor);
		Transforms.setNodes(
			editor,
			{ bold: isActive ? null : true },
			{ match: (n) => Text.isText(n), split: true }
		);
	},

	toggleCodeBlock(editor) {
		const isActive = CustomEditor.isCodeBlockActive(editor);
		Transforms.setNodes(
			editor,
			{ type: isActive ? null : "code" },
			{ match: (n) => Editor.isBlock(editor, n) }
		);
	},
};
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
	defaultOptions.table,
	defaultOptions.media_embed,
	defaultOptions.code_block,
].map(
	({
		type,
		level,
		component,
		...options
	}: {
		type: string;
		level?: number;
		component: any;
	}) => [
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
							color: "rgba(55, 53, 47, 0.3)",
						}}
					/>
				),
				styles: {
					blockAndGutter: {
						padding: "4px 0",
					},
					blockToolbarWrapper: {
						height: "1.5em",
					},
				},
			}),
			rootProps: {
				styles: {
					root: {
						margin: 0,
						lineHeight: "1.5",
					},
				},
			},
		},
	]
);

const options = {
	...defaultOptions,
	...Object.fromEntries(draggableComponentOptions),
};

console.log("🚀 ~ file: App.tsx ~ line 200 ~ options", options);
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
			{ hotkey: "shift+enter" },
			{
				hotkey: "enter",
				query: {
					allow: [
						options.code_block.type,
						options.blockquote.type,
						options.td.type,
					],
				},
			},
		],
	}),
	ExitBreakPlugin({
		rules: [
			{
				hotkey: "mod+enter",
			},
			{
				hotkey: "mod+shift+enter",
				before: true,
			},
			{
				hotkey: "enter",
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
	withDeserializeHTML({ plugins }),
	withMarks(),
	withImageUpload(),
	withAutoformat({ rules: autoformatRules }),
	withNodeID(),
	withNormalizeTypes({
		rules: [{ path: [0, 0], strictType: options.h1.type }],
	}),
	withTrailingNode({ type: options.p.type, level: 1 }),
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
			block.id = lodash.uniqueId();
		});
	});
};

setNodeId(initialValue);

function App() {
	// const layouts = getLayoutsFromSomewhere();
	const decorate: any = [];
	const [value, setValue] = useState<Node[]>(
		JSON.parse(localStorage.getItem("content")) || initialValue
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

	return (
		<div className="App">
			<DndProvider backend={HTML5Backend}>
				<Slate
					editor={editor}
					value={value}
					onChange={(value) => {
						setValue(value);
						onChangeMention(editor);
						const content = JSON.stringify(value);
						localStorage.setItem("content", content);
					}}
				>
					{/* <ResponsiveGridLayout
					// width=""
					className="layout"
					// layouts={layouts}
					breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
					cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
				>
					<div key="1">3</div>
					<div key="2">3</div>
				</ResponsiveGridLayout>
				<div>eqwewwq</div> */}
					<MentionSelect at={target} valueIndex={index} options={values} />
					<BalloonToolbar arrow>
						<ToolbarMark
							reversed
							type={MARK_BOLD}
							icon={<FormatBold />}
							tooltip={{ content: "Bold (⌘B)" }}
						/>
						<ToolbarMark
							reversed
							type={MARK_ITALIC}
							icon={<FormatItalic />}
							tooltip={{ content: "Italic (⌘I)" }}
						/>
						<ToolbarMark
							reversed
							type={MARK_UNDERLINE}
							icon={<FormatUnderlined />}
							tooltip={{ content: "Underline (⌘U)" }}
						/>
					</BalloonToolbar>
					<EditablePlugins
						spellCheck={false}
						plugins={plugins}
						placeholder="Enter some text..."
						onKeyDown={onKeyDown}
						onKeyDownDeps={[index, mentionSearch, target]}
					/>
					{/* <Editable
					renderElement={renderElement}
					renderLeaf={renderLeaf}f
					placeholder="Write some markdown..."
					spellCheck={false}
					onKeyDown={(event) => {
						if (!event.ctrlKey) {
							return;
						}

						// Replace the `onKeyDown` logic with our new commands.
						switch (event.key) {
							case "`": {
								event.preventDefault();
								CustomEditor.toggleCodeBlock(editor);
								break;
							}

							case "b": {
								event.preventDefault();
								CustomEditor.toggleBoldMark(editor);
								break;
							}
						}
					}}
					autoFocus
				/> */}
				</Slate>
			</DndProvider>
		</div>
	);
}

export default App;
