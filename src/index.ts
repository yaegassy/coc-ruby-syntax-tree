import { commands, Executable, ExtensionContext, LanguageClient, Uri, window, workspace } from 'coc.nvim';

import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

import * as visualize from './features/visualize';

const promiseExec = promisify(exec);

let languageClient: LanguageClient | null = null;

export async function activate(context: ExtensionContext): Promise<void> {
  if (!workspace.getConfiguration('syntaxTree').get('enable', true)) return;

  const outputChannel = window.createOutputChannel('Syntax Tree');

  context.subscriptions.push(
    outputChannel,
    commands.registerCommand('syntaxTree.start', startLanguageServer),
    commands.registerCommand('syntaxTree.stop', stopLanguageServer),
    commands.registerCommand('syntaxTree.restart', restartLanguageServer),
    commands.registerCommand('syntaxTree.showOutputChannel', () => outputChannel.show()),
    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('syntaxTree')) {
        restartLanguageServer();
      }
    })
  );

  await startLanguageServer();

  function getCWD() {
    if (workspace.workspaceFolders[0].uri) {
      return Uri.parse(workspace.workspaceFolders[0].uri).fsPath;
    } else {
      return process.cwd();
    }
  }

  async function getServerOptions(args: string[]): Promise<Executable> {
    const advancedConfig = workspace.getConfiguration('syntaxTree.advanced');
    let value = advancedConfig.get<string>('commandPath');

    if (value) {
      const substitution = new RegExp('\\$\\{([^}]*)\\}');

      for (let match = substitution.exec(value); match; match = substitution.exec(value)) {
        switch (match[1]) {
          case 'cwd':
            value = value.replace(match[0], process.cwd());
            break;
          case 'pathSeparator':
            value = value.replace(match[0], path.sep);
            break;
          case 'userHome':
            value = value.replace(match[0], os.homedir());
            break;
        }
      }

      try {
        if (fs.statSync(value).isFile()) {
          return { command: value, args };
        }
      } catch {
        outputChannel.appendLine(`Ignoring bogus commandPath (${value} does not exist).`);
      }
    }

    try {
      const cwd = getCWD();
      await promiseExec('bundle show syntax_tree', { cwd });
      return { command: 'bundle', args: ['exec', 'stree'].concat(args), options: { cwd } };
    } catch {
      // Do nothing.
    }

    const executablePaths = await Promise.all(
      (process.env.PATH || '')
        .split(path.delimiter)
        .filter((directory) => directory.includes('ruby'))
        .map((directory) => {
          const executablePath = path.join(directory, 'stree');

          return fs.promises.stat(executablePath).then(
            (stat) => (stat.isFile() ? executablePath : null),
            () => null
          );
        })
    );

    for (const executablePath of executablePaths) {
      if (executablePath) {
        return { command: executablePath, args };
      }
    }

    // Otherwise, fall back to the global stree lookup.
    return { command: 'stree', args };
  }

  async function startLanguageServer() {
    if (languageClient) {
      return; // preserve idempotency
    }

    const config = workspace.getConfiguration('syntaxTree');

    const args = ['lsp'];
    const plugins = new Set<string>();

    if (config.get<boolean>('singleQuotes')) {
      plugins.add('plugin/single_quotes');
    }

    if (config.get<boolean>('trailingComma')) {
      plugins.add('plugin/trailing_comma');
    }

    const additionalPlugins = config.get<string[]>('additionalPlugins');
    if (additionalPlugins) {
      additionalPlugins.forEach((plugin) => plugins.add(plugin));
    }

    if (plugins.size > 0) {
      args.push(`--plugins=${Array.from(plugins).join(',')}`);
    }

    const printWidth = config.get<number>('printWidth');
    if (printWidth) {
      args.push(`--print-width=${printWidth}`);
    }

    const ignoreFiles = config.get<string>('ignoreFiles');
    if (ignoreFiles) {
      args.push(`--ignore-files=${ignoreFiles}`);
    }

    const run = await getServerOptions(args);
    outputChannel.appendLine(`Starting language server: ${run.command} ${run.args?.join(' ')}`);

    languageClient = new LanguageClient(
      'Syntax Tree',
      { run, debug: run },
      {
        documentSelector: [
          { scheme: 'file', language: 'haml' },
          { scheme: 'file', language: 'ruby' },
          { scheme: 'file', pattern: '**/Gemfile' },
        ],
        outputChannel,
      }
    );

    try {
      await languageClient.start();
    } catch (error) {
      languageClient = null;
      window.showErrorMessage(`stree (syntax_tree) not found.`);
    }
  }

  async function stopLanguageServer() {
    if (languageClient) {
      outputChannel.appendLine('Stopping language server...');
      await languageClient.stop();
      languageClient = null;
    }
  }

  async function restartLanguageServer() {
    outputChannel.appendLine('Restarting language server...');
    await stopLanguageServer();
    await startLanguageServer();
  }

  visualize.register(context, languageClient);
}

export async function deactivate() {
  await languageClient?.stop();
  languageClient = null;
}
