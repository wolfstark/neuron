import React, { useState, useCallback, useMemo } from "react";
// import logo from "./logo.svg";
import "./App.css";
// import { Button, TextField } from "@material-ui/core";
import { Responsive, WidthProvider } from "react-grid-layout";
import styled from "styled-components";
import lodash from "lodash";
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

const initialValue = [
	{
		type: "paragraph",
		children: [
			{
				text:
					"Lorem ipsum dolor, sit amet consectetur adipisicing elit. Commodi doloremque tempore, enim officiis molestias veniam eaque saepe harum, rem repellendus beatae quas inventore nisi animi maxime, corrupti numquam quam perspiciatis!",
			},
		],
	},
	// {
	// 	type: "block-quote",
	// 	children: [{ text: "A wise quote." }],
	// },
	// {
	// 	type: "paragraph",
	// 	children: [
	// 		{
	// 			text:
	// 				'Order when you start a line with "## " you get a level-two heading, like this:',
	// 		},
	// 	],
	// },
	// {
	// 	type: "heading-two",
	// 	children: [{ text: "Try it out!" }],
	// },
	// {
	// 	type: "paragraph",
	// 	children: [
	// 		{
	// 			text:
	// 				'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
	// 		},
	// 	],
	// },
];

const SHORTCUTS = {
	"*": "list-item",
	"-": "list-item",
	"+": "list-item",
	">": "block-quote",
	"#": "heading-one",
	"##": "heading-two",
	"###": "heading-three",
	"####": "heading-four",
	"#####": "heading-five",
	"######": "heading-six",
};

const ResponsiveGridLayout = WidthProvider(Responsive);
const P = styled.p`
	font-size: 16px;
	text-align: center;
`;

const withShortcuts = (editor) => {
	const { deleteBackward, insertText } = editor;

	editor.insertText = (text) => {
		const { selection } = editor;

		if (text === " " && selection && Range.isCollapsed(selection)) {
			const { anchor } = selection;
			const block = Editor.above(editor, {
				match: (n) => Editor.isBlock(editor, n),
			});
			const path = block ? block[1] : [];
			const start = Editor.start(editor, path);
			const range = { anchor, focus: start };
			const beforeText = Editor.string(editor, range);
			const type = SHORTCUTS[beforeText];

			if (type) {
				Transforms.select(editor, range);
				Transforms.delete(editor);
				const newProperties: Partial<SlateElement> = {
					type,
				};
				Transforms.setNodes(editor, newProperties, {
					match: (n) => Editor.isBlock(editor, n),
				});

				if (type === "list-item") {
					const list = { type: "bulleted-list", children: [] };
					Transforms.wrapNodes(editor, list, {
						match: (n) =>
							!Editor.isEditor(n) &&
							SlateElement.isElement(n) &&
							n.type === "list-item",
					});
				}

				return;
			}
		}

		insertText(text);
	};
	editor.deleteBackward = (...args) => {
		const { selection } = editor;

		if (selection && Range.isCollapsed(selection)) {
			const match = Editor.above(editor, {
				match: (n) => Editor.isBlock(editor, n),
			});

			if (match) {
				const [block, path] = match;
				const start = Editor.start(editor, path);

				if (
					!Editor.isEditor(block) &&
					SlateElement.isElement(block) &&
					block.type !== "paragraph" &&
					Point.equals(selection.anchor, start)
				) {
					const newProperties: Partial<SlateElement> = {
						type: "paragraph",
					};
					Transforms.setNodes(editor, newProperties);

					if (block.type === "list-item") {
						Transforms.unwrapNodes(editor, {
							match: (n) =>
								!Editor.isEditor(n) &&
								SlateElement.isElement(n) &&
								n.type === "bulleted-list",
							split: true,
						});
					}

					return;
				}
			}

			deleteBackward(...args);
		}
	};

	return editor;
};
const Element = ({ attributes, children, element }) => {
	switch (element.type) {
		case "block-quote":
			return <blockquote {...attributes}>{children}</blockquote>;
		case "bulleted-list":
			return <ul {...attributes}>{children}</ul>;
		case "heading-one":
			return <h1 {...attributes}>{children}</h1>;
		case "heading-two":
			return <h2 {...attributes}>{children}</h2>;
		case "heading-three":
			return <h3 {...attributes}>{children}</h3>;
		case "heading-four":
			return <h4 {...attributes}>{children}</h4>;
		case "heading-five":
			return <h5 {...attributes}>{children}</h5>;
		case "heading-six":
			return <h6 {...attributes}>{children}</h6>;
		case "list-item":
			return <li {...attributes}>{children}</li>;
		case "code":
			return <code {...attributes}>{children}</code>;
		default:
			return <P {...attributes}>{children}</P>;
	}
};

const Leaf = (props) => {
	return (
		<span
			{...props.attributes}
			style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
		>
			{props.children}
		</span>
	);
};

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

function App() {
	// const layouts = getLayoutsFromSomewhere();
	const [value, setValue] = useState<Node[]>(
		JSON.parse(localStorage.getItem("content")) || [
			{
				type: "paragraph",
				children: [{ text: "A line of text in a paragraph." }],
			},
		]
	);
	const renderElement = useCallback((props) => <Element {...props} />, []);
	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);
	const editor = useMemo(
		() => withShortcuts(withReact(withHistory(createEditor()))),
		[]
	);

	return (
		<div className="App">
			<Slate
				editor={editor}
				value={value}
				onChange={(value) => {
					setValue(value);
					const content = JSON.stringify(value);
					localStorage.setItem("content", content);
				}}
			>
				<ResponsiveGridLayout
					// width=""
					className="layout"
					// layouts={layouts}
					breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
					cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
				>
					<div key="1">3</div>
					<div key="2">3</div>
				</ResponsiveGridLayout>
				<div>eqwewwq</div>
				<Editable
					renderElement={renderElement}
					renderLeaf={renderLeaf}
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
				/>
			</Slate>
		</div>
	);
}

export default App;
