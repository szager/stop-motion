import { ScreenOrientation } from '@enums/screen-orientation.enum';

export interface LayoutOptions {
    currentOrientation: ScreenOrientation;
    isLandscape: boolean;
    isPortrait: boolean;
    height: number;
    width: number;
}
