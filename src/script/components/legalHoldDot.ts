/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import ko from 'knockout';
import {Conversation} from '../entity/Conversation';
import {LegalHoldModalViewModel} from '../view_model/content/LegalHoldModalViewModel';

interface LegalHoldDotParams {
  isPending?: ko.Observable<boolean>;
  large?: boolean;
  conversation?: Conversation;
  legalHoldModal?: LegalHoldModalViewModel;
}

class LegalHoldDot {
  readonly conversation: Conversation;
  readonly isInteractive: boolean;
  readonly isPending: ko.Observable<boolean>;
  readonly large: boolean;
  readonly legalHoldModal: LegalHoldModalViewModel;

  constructor({isPending = ko.observable(false), large = false, conversation, legalHoldModal}: LegalHoldDotParams) {
    this.large = large;
    this.isPending = isPending;
    this.isInteractive = !!legalHoldModal;
    this.conversation = conversation;
    this.legalHoldModal = legalHoldModal;
    this.conversation = conversation;
  }

  onClick = (_: unknown, event: MouseEvent): void => {
    event.stopPropagation();

    if (this.isInteractive) {
      if (this.isPending()) {
        this.legalHoldModal.showRequestModal(true);
        return;
      }
      if (this.conversation) {
        this.legalHoldModal.showUsers(this.conversation);
        return;
      }
      this.legalHoldModal.showUsers();
    }
  };
}

ko.components.register('legal-hold-dot', {
  template: `
    <div class="legal-hold-dot"
         data-bind="click: onClick, css: {'legal-hold-dot--interactive': isInteractive, 'legal-hold-dot--large': large, 'legal-hold-dot--active': !isPending()}">
      <!-- ko if: isPending() -->
        <pending-icon></pending-icon>
      <!-- /ko -->
    </div>
    `,
  viewModel: {
    createViewModel(params: LegalHoldDotParams) {
      return new LegalHoldDot(params);
    },
  },
});
