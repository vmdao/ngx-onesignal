import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from '@angular-devkit/schematics';

import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import { Schema as ngxOneSignalSchema } from './schema';
import { installDependencies } from './installer/dependencies';
import { addPackageJsonDependencies } from './installer/ngx-onesignal-plus';
import { appVersion, angularCdkVersion } from '../util/versions';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';

export function ngxOnesignal(options: ngxOneSignalSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      addPackageJsonDependencies(
        'ngx-onesignal-plus',
        process.env.HAS_SANDBOX ? `file:../ngx-onesignal-plus.tgz` : appVersion,
        NodeDependencyType.Default
      ),
      addPackageJsonDependencies(
        '@angular/cdk',
        angularCdkVersion,
        NodeDependencyType.Dev
      ),
      installDependencies(),
      setupProject(options),
    ])(tree, context);
  };
}


function setupProject(options: ngxOneSignalSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const installTaskId = context.addTask(new NodePackageInstallTask());
    context.addTask(new RunSchematicTask('setup', options), [
      installTaskId,
    ]);
    return tree;
  };
}
