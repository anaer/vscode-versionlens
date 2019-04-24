/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AbstractCodeLensProvider } from 'providers/abstractCodeLensProvider';
import appContrib from 'common/appContrib';
import { generateCodeLenses } from 'common/codeLensGeneration';
import appSettings from 'common/appSettings';
import { findNodesInJsonContent, parseDependencyNodes } from 'common/dependencyParser';
import * as CommandFactory from 'commands/factory';
import { bowerGetPackageInfo } from './bowerAPI';
import { bowerPackageParser } from './bowerPackageParser';

const path = require('path');

export class BowerCodeLensProvider extends AbstractCodeLensProvider {

  get selector() {
    return {
      language: 'json',
      scheme: 'file',
      pattern: '**/bower.json',
      group: ['tags'],
    }
  }

  provideCodeLenses(document, token) {
    if (appSettings.showVersionLenses === false)
      return [];

    this._documentPath = path.dirname(document.uri.fsPath);

    const dependencyNodes = findNodesInJsonContent(
      document.getText(),
      appContrib.bowerDependencyProperties
    );

    const packageCollection = parseDependencyNodes(
      dependencyNodes,
      appContrib,
      bowerPackageParser
    );

    appSettings.inProgress = true;
    return generateCodeLenses(packageCollection, document)
      .then(codelenses => {
        appSettings.inProgress = false;
        return codelenses;
      });
  }

  evaluateCodeLens(codeLens) {
    if (codeLens.command && codeLens.command.command.includes('updateDependenciesCommand'))
      return codeLens;

    if (codeLens.package.version === 'latest')
      return CommandFactory.createMatchesLatestVersionCommand(codeLens);

    if (codeLens.package.meta) {
      if (codeLens.package.meta.type === 'github')
        return CommandFactory.createGithubCommand(codeLens);

      if (codeLens.package.meta.type === 'file')
        return CommandFactory.createLinkCommand(codeLens);
    }

    return bowerGetPackageInfo(codeLens.package.name, this._documentPath)
      .then(info => {
        return CommandFactory.createVersionCommand(
          codeLens.package.version,
          info.latest.version,
          codeLens
        );
      })
      .catch(err => {
        console.error(err);
        return CommandFactory.createErrorCommand(
          `An error occurred retrieving '${codeLens.package.name}' package`,
          codeLens
        );
      });
  }

}