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

import * as faker from 'faker';
import UUID from 'pure-uuid';
import type {User as APIClientUser} from '@wireapp/api-client/dist/user';
import {UserAssetType} from '@wireapp/api-client/dist/user';

import type {User} from '../../src/script/entity/User';
import {serverTimeHandler} from '../../src/script/time/serverTimeHandler';
import {UserMapper} from '../../src/script/user/UserMapper';

export class UserGenerator {
  static getRandomUser(): User | void {
    const template: APIClientUser = {
      accent_id: Math.floor(Math.random() * 7 + 1),
      assets: [
        {
          key: `3-1-${new UUID(4).format()}`,
          size: UserAssetType.PREVIEW,
          type: 'image',
        },
        {
          key: `3-1-${new UUID(4).format()}`,
          size: UserAssetType.COMPLETE,
          type: 'image',
        },
      ],
      handle: faker.internet.userName(),
      id: new UUID(4).format(),
      name: faker.name.findName(),
    };

    return new UserMapper(serverTimeHandler).mapUserFromJson(template);
  }
}
