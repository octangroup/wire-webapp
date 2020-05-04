/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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
import {debounce} from 'underscore';

import {interpolate} from 'Util/ArrayUtil';
import {clamp} from 'Util/NumberUtil';
import {File} from '../../../entity/message/File';

interface AudioSeekBarComponentParams {
  asset: File;
  disabled: ko.Subscribable<boolean>;
  src: HTMLAudioElement;
}

class AudioSeekBarComponent {
  readonly _onResizeFired: () => void;
  readonly audioElement: HTMLAudioElement;
  readonly element: Node;
  readonly loudness: number[];
  levels: HTMLSpanElement[];

  constructor(params: AudioSeekBarComponentParams, componentInfo: ko.components.ComponentInfo) {
    this.audioElement = params.src;

    this.element = componentInfo.element;
    this.loudness = [];
    this.levels = [];

    ko.computed(
      () => {
        if (typeof params.disabled === 'function') {
          (this.element as HTMLElement).classList.toggle('element-disabled', params.disabled());
        }
      },
      {disposeWhenNodeIsRemoved: componentInfo.element},
    );

    const assetMeta = params.asset.meta;
    if (assetMeta?.loudness !== null) {
      this.loudness = this._normalizeLoudness(assetMeta.loudness, (this.element as HTMLElement).clientHeight);
    }

    this._onResizeFired = debounce(() => {
      this._renderLevels();
      this._onTimeUpdate();
    }, 500);

    this._renderLevels();

    this.audioElement.addEventListener('ended', this._onAudioEnded);
    this.audioElement.addEventListener('timeupdate', this._onTimeUpdate);
    this.element.addEventListener('click', this._onLevelClick);
    window.addEventListener('resize', this._onResizeFired);
  }

  _renderLevels(): void {
    const numberOfLevelsFitOnScreen = Math.floor((this.element as HTMLElement).clientWidth / 3); // 2px + 1px
    const scaledLoudness = interpolate(this.loudness, numberOfLevelsFitOnScreen);
    (this.element as HTMLElement).innerHTML = '';

    this.levels = scaledLoudness.map(loudness => {
      const level = document.createElement('span');
      level.style.height = `${loudness}px`;
      this.element.appendChild(level);
      return level;
    });
  }

  _normalizeLoudness(loudness: number[], max: number): number[] {
    const peak = Math.max(...loudness);
    const scale = max / peak;
    return peak > max ? loudness.map(level => level * scale) : loudness;
  }

  _onLevelClick = (event: JQueryMouseEventObject): void => {
    const mouse_x = event.pageX - event.currentTarget.getBoundingClientRect().left;
    const calculatedTime = (this.audioElement.duration * mouse_x) / event.currentTarget.clientWidth;
    const currentTime = isNaN(calculatedTime) ? 0 : calculatedTime;

    this.audioElement.currentTime = clamp(currentTime, 0, this.audioElement.duration);
    this._onTimeUpdate();
  };

  _onTimeUpdate = (): void => {
    const index = Math.floor((this.audioElement.currentTime / this.audioElement.duration) * this.levels.length);
    this.levels.forEach((level, levelIndex) => level.classList.toggle('active', levelIndex <= index));
  };

  _onAudioEnded = (): void => this.levels.forEach(level => level.classList.remove('active'));

  dispose = (): void => {
    this.audioElement.removeEventListener('ended', this._onAudioEnded);
    this.audioElement.removeEventListener('timeupdate', this._onTimeUpdate);
    this.element.removeEventListener('click', this._onLevelClick);
    window.removeEventListener('resize', this._onResizeFired);
  };
}

ko.components.register('audio-seek-bar', {
  template: '<!-- content is generated -->',
  viewModel: {
    createViewModel(params: AudioSeekBarComponentParams, componentInfo: ko.components.ComponentInfo) {
      return new AudioSeekBarComponent(params, componentInfo);
    },
  },
});
