//===----------------------------------------------------------------------===//
//
// This source file is part of the VSCode Swift open source project
//
// Copyright (c) 2021 the VSCode Swift project authors
// Licensed under Apache License v2.0
//
// See LICENSE.txt for license information
// See CONTRIBUTORS.txt for the list of VSCode Swift project authors
//
// SPDX-License-Identifier: Apache-2.0
//
//===----------------------------------------------------------------------===//

import * as vscode from 'vscode';
import { PackageWatcher } from './PackageWatcher';
import { SwiftPackage } from './SwiftPackage';
import contextKeys from './contextKeys';

export class FolderContext implements vscode.Disposable {
    private packageWatcher?: PackageWatcher;

	private constructor(
        public folder: vscode.WorkspaceFolder,
        public swiftPackage: SwiftPackage,
        readonly isRootFolder: boolean
    ) {
        if (this.isRootFolder) {
            this.packageWatcher = new PackageWatcher(this);
            this.packageWatcher.install();
            this.setContextKeys();
        }
    }

    dispose() {
        this.packageWatcher?.dispose();
    }

    static async create(
        rootFolder: vscode.WorkspaceFolder,
        isRootFolder: boolean
    ): Promise<FolderContext> 
    {
        let swiftPackage = await SwiftPackage.create(rootFolder);
        return new FolderContext(rootFolder, swiftPackage, isRootFolder);
    }

    async reload() {
        await this.swiftPackage.reload();
        if (this.isRootFolder) {
            this.setContextKeys();
        }
    }

    private setContextKeys() {
        if (this.swiftPackage.isValid) {
            contextKeys.hasPackage = true;
            contextKeys.packageHasDependencies = this.swiftPackage.dependencies.length > 0;  
        }
        contextKeys.hasPackage = false;
        contextKeys.packageHasDependencies = false;
}
}
