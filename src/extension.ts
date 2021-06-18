// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import login, { LoginResult } from './login';
import { TreeNode } from './providers/BaseProvider';
import topicItemClick from './commands/topicItemClick';
import CustomProvider from './providers/CustomProvider';
import addNode from './commands/addNode';
import removeNode from './commands/removeNode';
import { EOL } from 'os';
import Global from './global';
import { NGA } from './nga';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	Global.context = context;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "nga-mofish" is now active!');

	const customProvider = new CustomProvider();
	vscode.window.createTreeView('nga-custom', {
		treeDataProvider: customProvider,
		showCollapseAll: true
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let testDisposable = vscode.commands.registerCommand('nga.test', () => {
		console.log(Global.getCookie());
	});

	let cDisposable1 = vscode.commands.registerCommand('nga.login', async () => {
		const loginResult = await login();
		if (loginResult === LoginResult.success || loginResult === LoginResult.logout) {
			vscode.window.showInformationMessage('Hello VS Code from NGA-MoFish!');
		}
	});

	// 公共事件：复制链接
	let cDisposable2 = vscode.commands.registerCommand('nga.copyLink', (item: TreeNode) => vscode.env.clipboard.writeText(item.link));

	// 公共事件：复制标题和链接
	let cDisposable3 = vscode.commands.registerCommand('nga.copyTitleLink', (item: TreeNode) =>
		vscode.env.clipboard.writeText(item.label + EOL + item.link)
	);

	// 公共事件：在浏览器中打开
	let cDisposable4 = vscode.commands.registerCommand('nga.viewInBrowser', (item: TreeNode) => vscode.env.openExternal(vscode.Uri.parse(item.link)));

	// 公共事件：点击浏览帖子
	let cDisposable5 = vscode.commands.registerCommand('nga.topicItemClick', (item: TreeNode) => topicItemClick(item));

	let cDisposable6 = vscode.commands.registerCommand('nga.open', async () => {
		let tid = await vscode.window.showInputBox({
			placeHolder: 'tid',
			prompt: '在此处输入帖子的tid，在Url可以看到哦！'
		});
		// 如果用户撤销输入，如ESC，则为undefined
		if (tid === undefined) {
			return;
		}
		NGA.getTopicByTid(tid);
	});

	// 自定义视图事件：添加自定义节点
	let cusDisposable1 = vscode.commands.registerCommand('nga-custom.addNode', async () => {
		const isAdd = await addNode();
		isAdd && customProvider.refreshNodeList();
	});

	// 自定义视图事件：刷新全部
	let cusDisposable2 = vscode.commands.registerCommand('nga-custom.refreshAll', () => customProvider.refreshAll());

	// 自定义视图事件：刷新当前节点
	let cusDisposable3 = vscode.commands.registerCommand('nga-custom.refreshNode', (root: TreeNode) => customProvider.refreshRoot(root));

	// 自定义视图事件：删除自定义节点
	let cusDisposable4 = vscode.commands.registerCommand('nga-custom.removeNode', (root: TreeNode) => {
		removeNode(root);
		customProvider.refreshNodeList();
	});

	// 公共事件：是否显示AC娘表情
	let cDisposable7 = vscode.commands.registerCommand('nga.showSticker', async() => {
		let bool = await vscode.window.showInputBox({
			placeHolder: 'true',
			prompt: '输入true或者false(注意大小写)',
			value: Global.context?.globalState.get('showSticker')
		});
		if (bool === 'false') {
			Global.context?.globalState.update('showSticker', false);
		} else if (bool === 'true') {
			Global.context?.globalState.update('showSticker', true);
		}
	});

	// 公共事件：帖子显示数量
	let cDisposable8 = vscode.commands.registerCommand('nga.setPostNum', async() => {
		let snum = await vscode.window.showInputBox({
			placeHolder: '30',
			prompt: '输入帖子显示的数量',
			value: Global.getPostNum().toString()
		});
		if (!snum) {
			snum = '';
		}
		let num = parseInt(snum);
		Global.setPostNum(num);
	});

	context.subscriptions.push(
		testDisposable,
		cDisposable1,
		cDisposable2,
		cDisposable3,
		cDisposable4,
		cDisposable5,
		cDisposable6,
		cusDisposable1,
		cusDisposable2,
		cusDisposable3,
		cusDisposable4,
		cDisposable7,
		cDisposable8,
	);
}

// this method is called when your extension is deactivated
export function deactivate() {
	Global.context = undefined;
}
