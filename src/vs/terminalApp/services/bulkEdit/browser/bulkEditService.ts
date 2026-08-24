/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { EditOperation, ISingleEditOperation } from '../../../../editor/common/core/editOperation.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IBulkEditOptions, IBulkEditResult, IBulkEditService, ResourceEdit, ResourceTextEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { WorkspaceEdit } from '../../../../editor/common/languages.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

/**
 * A text-only bulk edit service.
 *
 * The workbench implementation lives in `contrib/bulkEdit`, which also handles
 * notebook cell edits and file operations and therefore reaches
 * `contrib/notebook`. This window has no notebooks and no Explorer, but editor
 * features that surviving code instantiates -- paste-with-edits, drop into
 * editor, rename -- inject `IBulkEditService` unconditionally.
 *
 * This applies text edits directly through the model service, mirroring the
 * editor's own standalone implementation. Non-text edits are rejected rather
 * than silently dropped.
 */
class TerminalAppBulkEditService extends Disposable implements IBulkEditService {

	declare readonly _serviceBrand: undefined;

	constructor(
		@IModelService private readonly _modelService: IModelService
	) {
		super();
	}

	hasPreviewHandler(): false {
		return false;
	}

	setPreviewHandler(): IDisposable {
		return Disposable.None;
	}

	async apply(editsIn: ResourceEdit[] | WorkspaceEdit, _options?: IBulkEditOptions): Promise<IBulkEditResult> {
		const edits = Array.isArray(editsIn) ? editsIn : ResourceEdit.convert(editsIn);
		const textEdits = new Map<ITextModel, ISingleEditOperation[]>();

		for (const edit of edits) {
			if (!(edit instanceof ResourceTextEdit)) {
				throw new Error('bad edit - only text edits are supported');
			}
			const model = this._modelService.getModel(edit.resource);
			if (!model) {
				throw new Error('bad edit - model not found');
			}
			if (typeof edit.versionId === 'number' && model.getVersionId() !== edit.versionId) {
				throw new Error('bad state - model changed in the meantime');
			}
			let array = textEdits.get(model);
			if (!array) {
				array = [];
				textEdits.set(model, array);
			}
			array.push(EditOperation.replaceMove(Range.lift(edit.textEdit.range), edit.textEdit.text));
		}

		let totalEdits = 0;
		let totalFiles = 0;
		for (const [model, modelEdits] of textEdits) {
			model.pushStackElement();
			model.pushEditOperations([], modelEdits, () => []);
			model.pushStackElement();
			totalFiles += 1;
			totalEdits += modelEdits.length;
		}

		return {
			ariaSummary: localize('bulkEditServiceSummary', "Made {0} edits in {1} files", totalEdits, totalFiles),
			isApplied: totalEdits > 0
		};
	}
}

registerSingleton(IBulkEditService, TerminalAppBulkEditService, InstantiationType.Delayed);
