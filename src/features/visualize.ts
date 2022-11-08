import { commands, ExtensionContext, LanguageClient, Uri, workspace } from 'coc.nvim';
import * as path from 'path';

export async function register(context: ExtensionContext, client: LanguageClient) {
  await client.onReady();

  context.subscriptions.push(
    commands.registerCommand('syntaxTree.visualize', async () => {
      const { document } = await workspace.getCurrentState();

      if (document && document.languageId === 'ruby' && Uri.parse(document.uri).scheme === 'file') {
        const uri = Uri.parse(`syntaxTree.visualize:${document.uri.toString()}`);
        const res = await client.sendRequest<string>('syntaxTree/visualizing', { textDocument: { uri: uri.path } });

        const fileName = path.basename(uri.fsPath);
        const bufferName = `${fileName}-visualizing`;

        await workspace.nvim
          .command(`belowright vnew ${bufferName} | setlocal buftype=nofile bufhidden=hide noswapfile`)
          .then(async () => {
            const buf = await workspace.nvim.buffer;
            buf.setLines(res.split('\n'), { start: 0, end: -1 });
          });
      }
    })
  );
}
